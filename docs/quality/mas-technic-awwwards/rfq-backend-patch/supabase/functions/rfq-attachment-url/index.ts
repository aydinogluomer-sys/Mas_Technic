/**
 * rfq-attachment-url — a short-lived signed URL for ONE file of ONE request,
 * for a caller allowed to see it (rfq-backend-contract.md §2.5).
 *
 * NOT DEPLOYED. New function; the admin (RFQManager.tsx) and customer
 * (TekliflerimTab.tsx) screens would call it instead of building storage
 * URLs themselves — a change in admin/panel code that CLAUDE.md keeps out of
 * scope here, so it is listed in README.md as a follow-up for the owner.
 *
 *   POST { rfqId, storagePath }   Authorization: Bearer <user JWT>
 *   → 200 { url, expiresIn }      staff, or the customer who owns the RFQ
 *   → 401 no/invalid session · 403 not allowed · 404 not a file of that RFQ
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const BUCKET = "cad-uploads";
const EXPIRES_IN = 300;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

export async function handle(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Yalnız POST." });
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!bearer) return json(401, { error: "Oturum gerekli." });
    const { data: auth } = await db.auth.getUser(bearer);
    const userId = auth?.user?.id;
    if (!userId) return json(401, { error: "Oturum gerekli." });

    let body: { rfqId?: unknown; storagePath?: unknown };
    try { body = await req.json(); } catch { return json(400, { error: "İstek okunamadı." }); }
    if (typeof body.rfqId !== "string" || typeof body.storagePath !== "string") return json(400, { error: "Eksik alan." });

    const { data: rfq } = await db.from("rfqs").select("id, user_id, files, attachments").eq("id", body.rfqId).maybeSingle();
    if (!rfq) return json(404, { error: "Talep bulunamadı." });
    const paths = new Set<string>([
      ...((rfq.files as string[] | null) ?? []),
      ...(((rfq.attachments as { storagePath: string }[] | null) ?? []).map((item) => item.storagePath)),
    ]);
    if (!paths.has(body.storagePath)) return json(404, { error: "Dosya bu talebe ait değil." });

    const { data: staff } = await db.rpc("is_staff", { _user_id: userId });
    if (staff !== true && rfq.user_id !== userId) return json(403, { error: "Bu dosyayı görme yetkiniz yok." });

    const { data: signed, error } = await db.storage.from(BUCKET).createSignedUrl(body.storagePath, EXPIRES_IN);
    if (error || !signed?.signedUrl) return json(500, { error: "Bağlantı oluşturulamadı." });
    return json(200, { url: signed.signedUrl, expiresIn: EXPIRES_IN });
  } catch (error) {
    console.error("rfq-attachment-url error:", error instanceof Error ? error.name : "unknown");
    return json(500, { error: "Sunucu hatası." });
  }
}

Deno.serve(handle);
