import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════════
   CHAT LAUNCHER — the button only (PERF01)

   The chat used to arrive on every public route ~10 s after load whether or
   not anybody opened it: the panel, framer-motion's presence logic, the
   markdown renderer and the FAQ matcher — 39 KiB gzip on `/`, measured with
   `scripts/quality/capture-requests.mjs`. The contract asks for the renderer
   on the reader's first open and for the launcher to give first access on its
   own. So this file is the launcher alone: same markup, same position, same
   step-aside rule over the footer's conversion row. Clicking it is what loads
   `ChatBot`, which then opens straight into the panel.
   ══════════════════════════════════════════════════════════════════════════ */

export function ChatLauncher({ onOpen, busy = false }: { onOpen: () => void; busy?: boolean }) {
  const { t } = useTranslation();
  const [yieldToFooter, setYieldToFooter] = useState(false);

  /* The same rule `ChatBot` applies once loaded: below 768px the launcher
     steps aside while the footer's conversion row is on screen. */
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let tries = 0;
    let timer = 0;
    const attach = () => {
      const target = document.querySelector(".shell-footer-actions");
      if (!target) {
        if (tries++ < 20) timer = window.setTimeout(attach, 250);
        return;
      }
      observer = new IntersectionObserver(([entry]) => {
        setYieldToFooter(entry.isIntersecting && window.innerWidth < 768);
      });
      observer.observe(target);
    };
    attach();
    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, []);

  return (
    <button
      type="button"
      data-chat-launcher
      data-yield={yieldToFooter || undefined}
      aria-busy={busy || undefined}
      onClick={onOpen}
      className="chat-launcher fixed z-50 flex h-12 w-12 items-center justify-center md:h-14 md:w-14"
      style={{
        bottom: "calc(5.75rem + var(--shell-safe-bottom))",
        right: "max(1rem, var(--shell-safe-right))",
      }}
      aria-label={t("Sohbet aç")}
    >
      <MessageCircle className="w-6 h-6" aria-hidden="true" />
    </button>
  );
}
