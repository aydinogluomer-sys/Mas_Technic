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

    const SUPABASE_URL_AUTH = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(SUPABASE_URL_AUTH, SUPABASE_ANON_KEY, {
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
    const SUPABASE_SERVICE_ROLE_KEY_PRE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminCheck = createClient(SUPABASE_URL_AUTH, SUPABASE_SERVICE_ROLE_KEY_PRE);

    const { data: roleData } = await adminCheck
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

    const PARASUT_CLIENT_ID = Deno.env.get("PARASUT_CLIENT_ID");
    const PARASUT_CLIENT_SECRET = Deno.env.get("PARASUT_CLIENT_SECRET");
    const PARASUT_COMPANY_ID = Deno.env.get("PARASUT_COMPANY_ID");
    const PARASUT_USERNAME = Deno.env.get("PARASUT_USERNAME");
    const PARASUT_PASSWORD = Deno.env.get("PARASUT_PASSWORD");

    if (!PARASUT_CLIENT_ID || !PARASUT_CLIENT_SECRET || !PARASUT_COMPANY_ID || !PARASUT_USERNAME || !PARASUT_PASSWORD) {
      return new Response(JSON.stringify({ 
        error: "Paraşüt API anahtarları yapılandırılmamış. Lütfen PARASUT_CLIENT_ID, PARASUT_CLIENT_SECRET, PARASUT_COMPANY_ID, PARASUT_USERNAME ve PARASUT_PASSWORD secret'larını ekleyin.",
        configured: false 
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = adminCheck;

    // Get Paraşüt OAuth token
    const tokenRes = await fetch("https://api.parasut.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "password",
        client_id: PARASUT_CLIENT_ID,
        client_secret: PARASUT_CLIENT_SECRET,
        username: PARASUT_USERNAME,
        password: PARASUT_PASSWORD,
        redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Paraşüt auth error:", err);
      return new Response(JSON.stringify({ error: "Paraşüt kimlik doğrulama hatası", details: err }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { access_token } = await tokenRes.json();

    // Fetch purchase bills (gelen faturalar)
    const billsRes = await fetch(
      `https://api.parasut.com/v4/${PARASUT_COMPANY_ID}/purchase_bills?page[size]=25&sort=-issue_date`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!billsRes.ok) {
      const err = await billsRes.text();
      throw new Error(`Paraşüt API error [${billsRes.status}]: ${err}`);
    }

    const billsData = await billsRes.json();
    const bills = billsData.data || [];
    let synced = 0;

    for (const bill of bills) {
      const attrs = bill.attributes;
      const docNumber = `PST-${bill.id}`;

      // Check if already synced
      const { data: existing } = await supabase
        .from("financial_documents")
        .select("id")
        .eq("doc_number", docNumber)
        .maybeSingle();

      if (existing) continue;

      const amount = parseFloat(attrs.net_total || "0");
      const vatAmount = parseFloat(attrs.total_vat || "0");
      const totalAmount = parseFloat(attrs.gross_total || "0");
      const vatRate = amount > 0 ? Math.round((vatAmount / amount) * 100) : 18;

      await supabase.from("financial_documents").insert({
        doc_type: "fatura",
        doc_number: docNumber,
        title: attrs.description || attrs.item_type || "Paraşüt Faturası",
        vendor: null,
        amount,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        currency: attrs.currency || "TRY",
        doc_date: attrs.issue_date || null,
        due_date: attrs.due_date || null,
        status: "onaylandı",
        payment_status: attrs.remaining_payment === "0.0" ? "ödendi" : "ödenmedi",
        source: "parasut",
        ai_summary: `Paraşüt'ten otomatik senkronize edildi. Belge ID: ${bill.id}`,
      });

      synced++;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      synced, 
      total_fetched: bills.length,
      message: `${synced} yeni fatura senkronize edildi.`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Paraşüt sync error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
