import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get unpaid financial documents with due_date within 3 days
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const todayStr = today.toISOString().split("T")[0];
    const futureStr = threeDaysLater.toISOString().split("T")[0];

    const { data: docs, error: docsError } = await supabase
      .from("financial_documents")
      .select("id, doc_number, total_amount, due_date, user_id, doc_type")
      .not("user_id", "is", null)
      .in("payment_status", ["ödenmedi", "kısmi"])
      .gte("due_date", todayStr)
      .lte("due_date", futureStr);

    if (docsError) throw docsError;

    let sentCount = 0;

    for (const doc of docs || []) {
      // Check if we already sent a reminder for this doc today
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", doc.user_id)
        .like("message", `%${doc.doc_number || doc.id}%vade%`)
        .gte("created_at", `${todayStr}T00:00:00`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const dueDate = new Date(doc.due_date);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const dayLabel = diffDays <= 0 ? "BUGÜN" : diffDays === 1 ? "YARIN" : `${diffDays} gün sonra`;

      await supabase.from("notifications").insert({
        user_id: doc.user_id,
        type: "finance",
        title: `⏰ Vade Hatırlatma: ${dayLabel}`,
        message: `${doc.doc_number || doc.doc_type} numaralı belgenin vadesi ${dayLabel} (${doc.due_date}) doluyor. Tutar: ₺${Number(doc.total_amount || 0).toLocaleString("tr-TR")}`,
      });

      sentCount++;
    }

    return new Response(JSON.stringify({ success: true, sent: sentCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
