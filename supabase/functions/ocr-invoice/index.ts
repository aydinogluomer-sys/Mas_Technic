import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth check
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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const userId = claimsData.claims.sub;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin yetkisi gerekli" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { file_path, doc_id } = await req.json();
    if (!file_path || !doc_id) throw new Error("file_path and doc_id are required");

    // Download the file from storage
    const { data: fileData, error: dlError } = await supabase.storage
      .from("finance-docs")
      .download(file_path);
    if (dlError) throw new Error("File download failed: " + dlError.message);

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = file_path.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg";

    // Call Lovable AI with vision for OCR
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Sen bir Türk fatura/fiş OCR uzmanısın. Yüklenen belgeden aşağıdaki bilgileri JSON olarak çıkar. Sadece JSON döndür, başka bir şey yazma.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Bu fatura/fiş görselinden aşağıdaki bilgileri çıkar ve JSON olarak döndür:
{
  "doc_type": "fatura|fiş|çek|dekont|e-fatura",
  "doc_number": "belge numarası",
  "title": "belge başlığı/açıklama",
  "vendor": "tedarikçi/firma adı",
  "amount": sayısal tutar (KDV hariç),
  "vat_rate": KDV oranı (sayı),
  "vat_amount": KDV tutarı (sayı),
  "total_amount": toplam tutar (sayı),
  "category": "Hammadde|Takım Giderleri|Sarf Malzeme|Bakım|Sabit Giderler|Yazılım|Personel|Nakliye|Diğer",
  "doc_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD veya null",
  "currency": "TRY|USD|EUR",
  "ai_summary": "Belgenin kısa özeti (1-2 cümle)"
}
Eğer bir alanı bulamazsan null yaz. Tutarları sayısal olarak yaz (virgül değil nokta kullan).`
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}` }
              }
            ]
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "AI hız limiti aşıldı, lütfen tekrar deneyin." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI kredisi tükendi." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI yanıtından JSON çıkarılamadı");
    
    const extracted = JSON.parse(jsonMatch[0]);

    // Update the document in DB
    const updateData: Record<string, unknown> = {};
    if (extracted.doc_type) updateData.doc_type = extracted.doc_type;
    if (extracted.doc_number) updateData.doc_number = extracted.doc_number;
    if (extracted.title) updateData.title = extracted.title;
    if (extracted.vendor) updateData.vendor = extracted.vendor;
    if (extracted.amount != null) updateData.amount = extracted.amount;
    if (extracted.vat_rate != null) updateData.vat_rate = extracted.vat_rate;
    if (extracted.vat_amount != null) updateData.vat_amount = extracted.vat_amount;
    if (extracted.total_amount != null) updateData.total_amount = extracted.total_amount;
    if (extracted.category) updateData.category = extracted.category;
    if (extracted.doc_date) updateData.doc_date = extracted.doc_date;
    if (extracted.due_date) updateData.due_date = extracted.due_date;
    if (extracted.currency) updateData.currency = extracted.currency;
    if (extracted.ai_summary) updateData.ai_summary = extracted.ai_summary;
    updateData.source = "ocr";

    const { error: updateError } = await supabase
      .from("financial_documents")
      .update(updateData)
      .eq("id", doc_id);

    if (updateError) throw new Error("DB update failed: " + updateError.message);

    return new Response(JSON.stringify({ success: true, extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("OCR error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
