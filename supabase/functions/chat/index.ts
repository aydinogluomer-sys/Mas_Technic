import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Sen MAS Technic'in AI asistanısın. CNC işleme, torna, freze, lazer kazıma, yüzey işlemleri ve özel imalat konularında yardımcı oluyorsun.
Türkçe yanıt ver. Kısa, net ve profesyonel ol.
Fiyat bilgisi verme — teklif almalarını öner (/teklif-al sayfası).
MAS Technic hakkında: Hassas CNC imalat, prototipten seri üretime, havacılık-savunma-otomotiv-medikal sektörlerine hizmet veriyor.`;

/* Server-side bounds (polish run). The only limit used to be a client-side
   localStorage counter, so any caller could post an unbounded history of any
   size. These caps keep one request to a normal chat turn. */
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;
const MAX_TOTAL_CHARS = 12000;

/* Request limits. The function is public (verify_jwt = false) and every
   call spends Gemini quota; without a server-side limit one caller could
   exhaust it. Both limits live in memory, so they hold per isolate, not
   across all of them. A separate Gemini project for the admin functions
   (GOOGLE_GEMINI_ADMIN_API_KEY) is what isolates their capacity.

   - Per client: 10 a minute. The client address comes from headers the
     gateway sets — Cloudflare's cf-connecting-ip, else the LAST
     X-Forwarded-For hop (the one the platform appends); the first hop is
     whatever the caller wrote and would let it pick a fresh key per call.
   - Per isolate: 120 a minute in total, whatever the address says, so a
     caller who does get a new key per request is still capped.

   The address is never kept: the key is a salted SHA-256 of it, the salt
   is random per isolate and never stored, and expired entries are dropped
   on every request. */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 10;
const RATE_MAX_TOTAL = 120;
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const isolateWindow = { count: 0, resetAt: 0 };
const salt = crypto.getRandomValues(new Uint8Array(16));

function clientAddress(req: Request): string {
  const cloudflare = req.headers.get("cf-connecting-ip")?.trim();
  if (cloudflare) return cloudflare;
  const hops = (req.headers.get("x-forwarded-for") ?? "").split(",").map((hop) => hop.trim()).filter(Boolean);
  return hops.at(-1) || req.headers.get("x-real-ip")?.trim() || "unknown";
}

async function clientKey(address: string): Promise<string> {
  const data = new Uint8Array([...salt, ...new TextEncoder().encode(address)]);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
  return Array.from(digest.subarray(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Seconds to wait, or 0 when the request may go through. */
function rateLimited(key: string): number {
  const now = Date.now();
  for (const [stored, entry] of rateLimits) if (now > entry.resetAt) rateLimits.delete(stored);

  if (now > isolateWindow.resetAt) Object.assign(isolateWindow, { count: 0, resetAt: now + RATE_WINDOW_MS });
  if (isolateWindow.count >= RATE_MAX_TOTAL) return Math.ceil((isolateWindow.resetAt - now) / 1000);

  const entry = rateLimits.get(key);
  if (entry && entry.count >= RATE_MAX_REQUESTS) return Math.ceil((entry.resetAt - now) / 1000);
  if (entry) entry.count += 1;
  else rateLimits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
  isolateWindow.count += 1;
  return 0;
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Yöntem desteklenmiyor." }, 405);

  const retryAfter = rateLimited(await clientKey(clientAddress(req)));
  if (retryAfter > 0) {
    return new Response(JSON.stringify({ error: "Çok fazla istek, lütfen biraz bekleyin." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(retryAfter) },
    });
  }

  try {
    const GEMINI_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GEMINI_KEY) {
      // Logged for the operator; the visitor never sees configuration details.
      console.error("chat: GOOGLE_GEMINI_API_KEY is not configured");
      return json({ error: "AI asistanı şu an kullanılamıyor." }, 503);
    }

    const payload = await req.json().catch(() => null);
    const messages = Array.isArray(payload?.messages) ? payload.messages : null;
    if (!messages || messages.length === 0) return json({ error: "Geçersiz istek." }, 400);

    const recent = messages.slice(-MAX_MESSAGES);
    let total = 0;
    const contents: { role: string; parts: { text: string }[] }[] = [];
    for (const msg of recent) {
      if (!msg || typeof msg.content !== "string" || msg.role === "system") continue;
      const text = msg.content.slice(0, MAX_MESSAGE_CHARS);
      total += text.length;
      if (total > MAX_TOTAL_CHARS) return json({ error: "Mesaj çok uzun." }, 413);
      contents.push({ role: msg.role === "assistant" ? "model" : "user", parts: [{ text }] });
    }
    if (contents.length === 0) return json({ error: "Geçersiz istek." }, 400);

    const model = Deno.env.get("GEMINI_CHAT_MODEL") || "gemini-2.0-flash";
    // The key travels in a header: a URL with the key can end up in logs.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const t = await response.text();
      console.error("Gemini API error:", status, t);
      
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Çok fazla istek, lütfen biraz bekleyin." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI servisi hatası" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transform Gemini SSE stream to OpenAI-compatible SSE stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    /* SSE lines can straddle network chunks. Parsing each chunk on its own
       silently dropped any line split across two; the tail is now buffered
       until its newline arrives. */
    let pending = "";
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        pending += decoder.decode(chunk, { stream: true });
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json) continue;
          
          try {
            const parsed = JSON.parse(json);
            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
              // Re-emit as OpenAI-compatible SSE
              const openaiChunk = {
                choices: [{ delta: { content } }],
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(openaiChunk)}\n\n`));
            }
          } catch { /* partial */ }
        }
      },
      flush(controller) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      },
    });

    return new Response(response.body!.pipeThrough(transformStream), {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return json({ error: "AI asistanı yanıt veremedi." }, 500);
  }
});
