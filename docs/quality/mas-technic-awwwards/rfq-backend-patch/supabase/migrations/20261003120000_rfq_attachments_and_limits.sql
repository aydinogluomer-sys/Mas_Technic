-- ════════════════════════════════════════════════════════════════════════
-- RFQ01–03 · server side — FORWARD-ONLY, NOT APPLIED
--
-- Prepared outside supabase/ because CLAUDE.md forbids schema changes there
-- without the owner's go-ahead (owner input O06). Apply on STAGING first:
--   supabase db push   (after copying this file into supabase/migrations/)
-- then run the acceptance list in ../README.md before production.
-- Every statement is idempotent so a re-run is harmless.
-- ════════════════════════════════════════════════════════════════════════

-- 1. Attachment metadata (rfq-backend-contract.md §2.1). `files` stays for the
--    admin and customer screens that read it today and for old rows.
alter table public.rfqs add column if not exists attachments jsonb;
do $$ begin
  alter table public.rfqs add constraint rfqs_attachments_is_array
    check (attachments is null or jsonb_typeof(attachments) = 'array');
exception when duplicate_object then null; end $$;

-- 2. Notification outcome (§2.8): 'sent' | 'failed' | 'not_configured'.
alter table public.rfqs add column if not exists email_status text;

-- 3. Rate limit shared by every isolate (§2.6). One row per key and window;
--    the function below increments atomically.
create table if not exists public.rfq_rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count integer not null default 0
);
alter table public.rfq_rate_limits enable row level security;
-- No policy: only the service role (the edge function) touches it.

create or replace function public.rfq_rate_limit_hit(p_key text, p_window_seconds integer, p_max integer)
returns table (allowed boolean, retry_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_row public.rfq_rate_limits%rowtype;
begin
  insert into public.rfq_rate_limits as r (key, window_start, count)
  values (p_key, v_now, 1)
  on conflict (key) do update
    set count = case when r.window_start <= v_now - make_interval(secs => p_window_seconds) then 1 else r.count + 1 end,
        window_start = case when r.window_start <= v_now - make_interval(secs => p_window_seconds) then v_now else r.window_start end
  returning * into v_row;

  allowed := v_row.count <= p_max;
  retry_after := greatest(1, ceil(extract(epoch from (v_row.window_start + make_interval(secs => p_window_seconds) - v_now)))::integer);
  return next;
end $$;
revoke all on function public.rfq_rate_limit_hit(text, integer, integer) from public, anon, authenticated;

-- 4. Public writes go through the edge function only. The current policy
--    ("Anyone can submit RFQ", any row with an id) let anyone bypass the
--    function's validation and rate limit with the anon key. The function
--    uses the service role (RLS does not apply to it); staff keep direct
--    insert for the admin quick action (QuickActionModals.tsx).
drop policy if exists "Anyone can submit RFQ" on public.rfqs;
drop policy if exists "Staff can insert rfqs" on public.rfqs;
create policy "Staff can insert rfqs" on public.rfqs
  for insert to authenticated
  with check (public.is_staff(auth.uid()));

-- 5. Orphaned uploads (§2.7): objects in cad-uploads, older than 24 h, whose
--    path no RFQ references. Listing is separate from deleting so staging can
--    dry-run it first.
create or replace function public.rfq_orphan_uploads(p_older_than interval default interval '24 hours')
returns table (name text, created_at timestamptz, size_bytes bigint)
language sql
security definer
set search_path = public, storage
as $$
  select o.name, o.created_at, coalesce((o.metadata->>'size')::bigint, 0)
  from storage.objects o
  where o.bucket_id = 'cad-uploads'
    and o.created_at < now() - p_older_than
    and not exists (
      select 1 from public.rfqs r
      where o.name = any (coalesce(r.files, '{}'::text[]))
         or exists (select 1 from jsonb_array_elements(coalesce(r.attachments, '[]'::jsonb)) a where a->>'storagePath' = o.name)
    );
$$;
revoke all on function public.rfq_orphan_uploads(interval) from public, anon, authenticated;
