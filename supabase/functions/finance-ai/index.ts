import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin yetkisi gerekli" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GEMINI_KEY) throw new Error("GOOGLE_GEMINI_API_KEY is not configured");

    const { documents, question, history } = await req.json();

    const docSummary = (documents || []).map((d: any) => 
      `${d.doc_type} | ${d.vendor || '-'} | ₺${d.total_amount || 0} | ${d.category || '-'} | ${d.payment_status || '-'} | ${d.doc_date || '-'}`
    ).join("\n");

    const systemPrompt = `Sen MAS Technic şirketinin finansal danışman AI'ısın. CNC imalat sektöründe uzman bir mali müşavirsin.
Türkçe yanıt ver. Kısa, öz ve aksiyona yönelik tavsiyeler ver.
Emoji kullan ama profesyonel kal. Her maddeyi yeni satırda yaz.
Eğer kullanıcı soru soruyorsa doğrudan cevapla.
Eğer soru yoksa genel finansal analiz ve öneriler sun.

Güncel finansal veriler:
${docSummary}`;

    const DEFAULT_PROMPT = `Aşağıdaki finansal belgeleri analiz et ve 5-7 madde halinde aksiyon önerileri sun.`;

    // Conversation history in Gemini's shape: the assistant role is "model"
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        if (h.role && h.content) {
          contents.push({ role: h.role === "assistant" ? "model" : "user", parts: [{ text: h.content }] });
        }
      }
    }
    // The panel's history opens with the automatic analysis, which answered
    // the default prompt; Gemini expects a conversation to open with the user.
    if (contents[0]?.role === "model") {
      contents.unshift({ role: "user", parts: [{ text: DEFAULT_PROMPT }] });
    }

    // Add current user message
    contents.push({ role: "user", parts: [{ text: question || DEFAULT_PROMPT }] });

    const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: {
        "x-goog-api-key": GEMINI_KEY,
        "Content-Type": "application/json",
      },
      // A stalled provider must not hold the function until the platform kills it
      signal: AbortSignal.timeout(60_000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.3 },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "AI hız limiti aşıldı, lütfen tekrar deneyin." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errorText);
      throw new Error("Gemini API error");
    }

    const aiData = await aiResponse.json();
    const content = (aiData.candidates?.[0]?.content?.parts ?? []).map((part: any) => part.text ?? "").join("") || "Analiz yapılamadı.";

    return new Response(JSON.stringify({ success: true, analysis: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "TimeoutError") {
      return new Response(JSON.stringify({ error: "AI yanıt vermedi, lütfen tekrar deneyin." }), {
        status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("Finance AI error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
