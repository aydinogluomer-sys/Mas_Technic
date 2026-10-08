#!/usr/bin/env bash
# Playwright's system packages for cached browsers, without letting apt eat the job.
# On 7-8 Oct 2026 apt hung until the job limit (20 and 60 min), and a killed
# attempt left its lock behind so a plain retry failed at once. apt now times
# out its own downloads, and each attempt that fails clears what it left.
#   usage: scripts/ci/install-deps.sh chromium | webkit firefox
set -u
printf 'Acquire::Retries "3";\nAcquire::http::Timeout "30";\nAcquire::https::Timeout "30";\n' \
  | sudo tee /etc/apt/apt.conf.d/99ci-timeouts >/dev/null
for attempt in 1 2 3; do
  if timeout --kill-after=15 300 npx playwright install-deps "$@"; then exit 0; fi
  echo "install-deps attempt $attempt failed; clearing apt before retrying"
  sudo pkill -9 -x apt-get || true
  sudo pkill -9 -x dpkg || true
  sudo rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/lib/apt/lists/lock /var/cache/apt/archives/lock
  sudo dpkg --configure -a || true
done
exit 1
