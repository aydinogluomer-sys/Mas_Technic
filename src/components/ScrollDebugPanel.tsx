import { useEffect, useState } from "react";
import { ScrollTrigger } from "@/hooks/use-gsap";

type DebugEvent = { type: string; id: string; progress: number };

export const ScrollDebugPanel = () => {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<DebugEvent[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isDebug = params.get("debug") === "gsap" || localStorage.getItem("mas_gsap_debug") === "1";
    setEnabled(isDebug);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onDebug = (event: Event) => {
      const detail = (event as CustomEvent<DebugEvent>).detail;
      if (!detail) return;
      setEvents((current) => [detail, ...current.filter((item) => item.id !== detail.id)].slice(0, 10));
    };
    window.addEventListener("mas:scroll-debug", onDebug);
    return () => window.removeEventListener("mas:scroll-debug", onDebug);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[80] font-mono text-[10px]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="border border-border bg-background/90 px-3 py-2 text-foreground shadow-lg backdrop-blur"
      >
        GSAP DEBUG
      </button>
      {open && (
        <div className="mt-2 w-72 border border-border bg-background/95 p-3 text-foreground shadow-lg backdrop-blur">
          <div className="mb-2 flex items-center justify-between text-muted-foreground">
            <span>ScrollTrigger</span>
            <span>{ScrollTrigger.getAll().length}</span>
          </div>
          <div className="space-y-1">
            {events.length === 0 ? <div className="text-muted-foreground">Henüz event yok</div> : null}
            {events.map((event) => (
              <div key={`${event.type}-${event.id}`} className="flex justify-between gap-3">
                <span>{event.type}:{event.id}</span>
                <span>{Math.round(event.progress * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};