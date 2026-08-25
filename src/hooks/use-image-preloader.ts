import { useEffect, useRef, useState } from "react";

interface UseImagePreloaderOptions {
  basePath: string;
  totalFrames: number;
  filePrefix?: string;
  eagerCount?: number;
}

export function useImagePreloader({
  basePath,
  totalFrames,
  filePrefix = "frame_",
  eagerCount = 10,
}: UseImagePreloaderOptions) {
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const images: (HTMLImageElement | null)[] = new Array(totalFrames).fill(null);
    let loaded = 0;
    let cancelled = false;

    const framePath = (i: number) => {
      const num = String(i + 1).padStart(4, "0");
      return `${basePath}/${filePrefix}${num}.webp`;
    };

    const onLoad = () => {
      if (cancelled) return;
      loaded++;
      setLoadedCount(loaded);
      if (loaded >= eagerCount) setReady(true);
    };

    const loadFrame = (i: number) => {
      const img = new Image();
      img.src = framePath(i);
      img.onload = onLoad;
      img.onerror = () => {
        if (cancelled) return;
        images[i] = null;
        // Başarısız frame sayılmaz — ready yanlış pozitif vermez
      };
      images[i] = img;
    };

    // Eager: ilk N frame hemen yükle
    for (let i = 0; i < Math.min(eagerCount, totalFrames); i++) {
      loadFrame(i);
    }

    // Lazy: kalan frame'ler requestIdleCallback ile
    const loadRemaining = () => {
      let idx = eagerCount;
      const loadNext = (deadline?: IdleDeadline) => {
        if (cancelled) return;
        while (idx < totalFrames && (!deadline || deadline.timeRemaining() > 2)) {
          loadFrame(idx);
          idx++;
        }
        if (idx < totalFrames) {
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(loadNext);
          } else {
            setTimeout(() => loadNext(), 16);
          }
        }
      };
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(loadNext);
      } else {
        setTimeout(() => loadNext(), 100);
      }
    };

    loadRemaining();
    imagesRef.current = images;

    return () => {
      cancelled = true;
      imagesRef.current = [];
    };
  }, [basePath, totalFrames, filePrefix, eagerCount]);

  return { images: imagesRef, loadedCount, ready, totalFrames };
}
