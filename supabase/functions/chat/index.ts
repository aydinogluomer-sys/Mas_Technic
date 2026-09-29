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

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Yöntem desteklenmiyor." }, 405);

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
