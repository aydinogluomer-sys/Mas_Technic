import { createRoot } from "react-dom/client";
import { BlurImage } from "@/components/BlurImage";

const root = createRoot(document.getElementById("root")!);
root.render(
  <div className="shell-root" style={{ display: "grid", gap: 16, padding: 16, width: 640, background: "var(--tl-black)" }}>
    <div id="broken" style={{ width: 320, height: 180 }}>
      <BlurImage src="/assets/this-file-does-not-exist.webp" alt="Hassas işlenmiş metal parça" width={1600} height={896} className="w-full h-full object-cover" />
    </div>
    <div id="ok" style={{ width: 320, height: 180 }}>
      <BlurImage src="/ok.webp" alt="Yüklenen resim" width={1600} height={896} className="w-full h-full object-cover" />
    </div>
  </div>,
);
