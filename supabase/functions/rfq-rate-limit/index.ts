import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limit store (per isolate lifecycle)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 5; // max 5 RFQ submissions per minute per IP
const ACCEPTED_FILE_EXTENSIONS = ["step", "stp", "stl", "obj", "iges", "igs", "3mf"];

function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.length <= 255;
}

function isValidFileList(files: unknown): files is string[] {
  if (!Array.isArray(files)) return false;
  return files.every((filePath) => {
    if (typeof filePath !== "string" || filePath.length > 512) return false;
    const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
    return ACCEPTED_FILE_EXTENSIONS.includes(ext);
  });
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) {
    return true;
  }

  return false;
}

// Cleanup old entries periodically
function cleanup() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    if (isRateLimited(ip)) {
      cleanup();
      return new Response(
        JSON.stringify({
          error: "Çok fazla talep gönderildi. Lütfen 1 dakika sonra tekrar deneyin.",
          retry_after: 60,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
        }
      );
    }

    // Parse RFQ data
    const body = await req.json();
    const { id, customer, company, email, phone, service, material, quantity, notes, files, user_id } = body;

    if (!id || typeof id !== "string" || id.length === 0) {
      return new Response(
        JSON.stringify({ error: "Geçersiz talep: id zorunludur." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Geçerli bir e-posta adresi zorunludur." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof customer !== "string" || customer.trim().length < 2 || customer.length > 120) {
      return new Response(
        JSON.stringify({ error: "Ad soyad alanı zorunludur." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof company !== "string" || company.trim().length < 2 || company.length > 160) {
      return new Response(
        JSON.stringify({ error: "Firma adı alanı zorunludur." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidFileList(files)) {
      return new Response(
        JSON.stringify({ error: "CAD dosyası formatı geçersiz." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for insert
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase.from("rfqs").insert({
      id,
      customer: customer || null,
      company: company || null,
      email: email.trim(),
      phone: phone || null,
      service: service || null,
      material: material || null,
      quantity: quantity || null,
      notes: notes || null,
      files: files || null,
      user_id: user_id || null,
      date: new Date().toISOString().split("T")[0],
      status: "Yeni",
    }).select().single();

    if (error) {
      console.error("RFQ insert error:", error);
      return new Response(
        JSON.stringify({ error: "Talep oluşturulamadı." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    cleanup();

    return new Response(
      JSON.stringify({ success: true, rfq: data }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("RFQ rate-limit function error:", err);
    return new Response(
      JSON.stringify({ error: "Sunucu hatası." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
