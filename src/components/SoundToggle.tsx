import { Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, forwardRef } from "react";

const STORAGE_KEY = "mas_sound";
const EVENT_NAME = "mas_sound_change";

export const SoundToggle = forwardRef<HTMLButtonElement>((_props, ref) => {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }, [enabled]);

  return (
    <button
      ref={ref}
      onClick={() => setEnabled(!enabled)}
      className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
      aria-label={enabled ? "Sesi kapat" : "Sesi aç"}
    >
      {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
    </button>
  );
});
SoundToggle.displayName = "SoundToggle";
