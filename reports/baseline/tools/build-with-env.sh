#!/usr/bin/env bash
# Phase 00 throwaway helper.
#
# This isolated worktree has no `.env` (it is gitignored, so `git worktree add`
# never brings it across). A production build without VITE_SUPABASE_URL throws
# at module scope and the entire React tree fails to mount, which makes every
# landing e2e spec and every visual capture meaningless.
#
# To measure the REAL baseline we export the same variables CI supplies from
# secrets (see .github/workflows/playwright.yml) by sourcing the primary
# checkout's .env into the process environment. Vite's loadEnv picks up
# VITE_-prefixed process.env entries, so no file is written into this worktree.
#
# Secrets are never echoed and never written to reports/.
set -euo pipefail

ENV_FILE="${1:-C:/Users/Trade Bilisim/precision-dynamics-hub-main/.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "ENV_FILE_NOT_FOUND: $ENV_FILE" >&2
  exit 2
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

echo "VITE_SUPABASE_URL_PRESENT=$([ -n "${VITE_SUPABASE_URL:-}" ] && echo yes || echo no)"
echo "VITE_SUPABASE_PUBLISHABLE_KEY_PRESENT=$([ -n "${VITE_SUPABASE_PUBLISHABLE_KEY:-}" ] && echo yes || echo no)"

shift || true
exec "$@"
