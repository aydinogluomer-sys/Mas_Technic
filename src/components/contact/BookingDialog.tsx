import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import { Z } from "@/styles/z-index";

/* ══════════════════════════════════════════════════════════════════════════
   THE BOOKING DIALOG — Google Calendar appointment page, embedded

   Availability, the Meet link and the reminder e-mails all belong to Google
   Calendar; this site owns only the frame. Two URLs, both from the owner's
   appointment schedule:

     BOOKING_EMBED_URL  the resolved schedule URL with `?gv=true`, the form
                        Google serves WITHOUT `X-Frame-Options` (measured: the
                        `calendar.app.google` short link and the plain schedule
                        URL both answer `X-Frame-Options: SAMEORIGIN`, which a
                        browser refuses to frame).
     BOOKING_LINK       the short link, for the always-visible new-tab action.

   The new-tab action is never hidden: it sits in the dialog bar from the
   first frame, and the dialog swaps to a dedicated fallback view if the frame
   has not loaded within LOAD_TIMEOUT_MS or reports an error.
   ══════════════════════════════════════════════════════════════════════════ */
export const BOOKING_LINK = "https://calendar.app.google/7V4P8Ygeh5YDSLWX7";
export const BOOKING_EMBED_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0-IwWF2PNsYYVPgT5PSzt4TqBoOGQB6-j7QxicKViNPg3k7ht0LTVPKR5qGVUND8w8ttCKI1Wy?gv=true";

const LOAD_TIMEOUT_MS = 8000;

type FrameState = "loading" | "ready" | "fallback";

export function BookingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, setState] = useState<FrameState>("loading");
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    setState("loading");
    returnFocus.current = document.activeElement;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();

    const timer = window.setTimeout(() => {
      setState((current) => (current === "loading" ? "fallback" : current));
    }, LOAD_TIMEOUT_MS);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), iframe");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      root.style.overflow = previousOverflow;
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="booking-dialog" style={{ zIndex: Z.dialog }} data-lenis-prevent>
      <div className="booking-dialog-scrim" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        className="booking-dialog-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-dialog-title"
        data-state={state}
      >
        <header className="booking-dialog-bar">
          <div>
            <p className="booking-dialog-code">TEKNİK GÖRÜŞME · GOOGLE MEET</p>
            <h2 id="booking-dialog-title">Uygun bir saat seçin</h2>
          </div>
          <div className="booking-dialog-actions">
            <a className="booking-newtab" href={BOOKING_LINK} target="_blank" rel="noopener noreferrer">
              Randevuyu yeni sekmede aç
              <ArrowUpRight aria-hidden="true" />
            </a>
            <button ref={closeRef} type="button" className="booking-close" onClick={onClose} aria-label="Kapat">
              <X aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="booking-dialog-body">
          {state !== "fallback" && (
            <iframe
              className="booking-frame"
              src={BOOKING_EMBED_URL}
              title="MAS Technic teknik görüşme randevu takvimi"
              loading="eager"
              onLoad={() => setState("ready")}
              onError={() => setState("fallback")}
            />
          )}
          {state === "loading" && (
            <div className="booking-skeleton" aria-live="polite">
              <span>TAKVİM YÜKLENİYOR</span>
              <i />
            </div>
          )}
          {state === "fallback" && (
            <div className="booking-fallback" role="status">
              <p className="booking-dialog-code">TAKVİM BURADA AÇILAMADI</p>
              <p className="booking-fallback-title">Randevu sayfasını yeni sekmede açın.</p>
              <p>
                Tarayıcınız gömülü takvimi engelledi. Aynı takvim Google Calendar üzerinde açılır; saat seçtiğinizde
                Google Meet daveti e-postanıza gelir.
              </p>
              <a className="booking-newtab booking-newtab--primary" href={BOOKING_LINK} target="_blank" rel="noopener noreferrer">
                Randevuyu yeni sekmede aç
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
