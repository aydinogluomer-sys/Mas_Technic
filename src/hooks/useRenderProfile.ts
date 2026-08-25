import { useState, useEffect } from "react";

export type RenderProfileTier = "high" | "medium" | "low" | "static";

export interface RenderProfile {
  tier: RenderProfileTier;
  enableWebGL: boolean;
  enablePostProcessing: boolean;
  enableShadows: boolean;
  particleMultiplier: number;
  fpsCap: number;
}

let cachedProfile: RenderProfile | null = null;

export function detectRenderProfile(): RenderProfile {
  if (typeof window === "undefined") {
    return {
      tier: "medium",
      enableWebGL: true,
      enablePostProcessing: false,
      enableShadows: false,
      particleMultiplier: 0.5,
      fpsCap: 60,
    };
  }

  if (cachedProfile) return cachedProfile;

  // 1. Reduced motion check
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    cachedProfile = {
      tier: "static",
      enableWebGL: false,
      enablePostProcessing: false,
      enableShadows: false,
      particleMultiplier: 0,
      fpsCap: 30,
    };
    return cachedProfile;
  }

  // 2. WebGL2 & Renderer check
  try {
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    if (!gl2) {
      cachedProfile = {
        tier: "static",
        enableWebGL: false,
        enablePostProcessing: false,
        enableShadows: false,
        particleMultiplier: 0,
        fpsCap: 30,
      };
      return cachedProfile;
    }

    const debugInfo = gl2.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const renderer = gl2.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
      if (/swiftshader|llvmpipe|mesa|software/i.test(renderer)) {
        cachedProfile = {
          tier: "low",
          enableWebGL: true,
          enablePostProcessing: false,
          enableShadows: false,
          particleMultiplier: 0.2,
          fpsCap: 30,
        };
        return cachedProfile;
      }
    }
  } catch {
    cachedProfile = {
      tier: "static",
      enableWebGL: false,
      enablePostProcessing: false,
      enableShadows: false,
      particleMultiplier: 0,
      fpsCap: 30,
    };
    return cachedProfile;
  }

  // 3. Hardware specs (deviceMemory & hardwareConcurrency)
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 4;
  const cores = nav.hardwareConcurrency ?? 4;

  if (memory >= 8 && cores >= 8) {
    cachedProfile = {
      tier: "high",
      enableWebGL: true,
      enablePostProcessing: true,
      enableShadows: true,
      particleMultiplier: 1.0,
      fpsCap: 60,
    };
  } else if (memory >= 4 && cores >= 4) {
    cachedProfile = {
      tier: "medium",
      enableWebGL: true,
      enablePostProcessing: false,
      enableShadows: true,
      particleMultiplier: 0.6,
      fpsCap: 60,
    };
  } else {
    cachedProfile = {
      tier: "low",
      enableWebGL: true,
      enablePostProcessing: false,
      enableShadows: false,
      particleMultiplier: 0.3,
      fpsCap: 30,
    };
  }

  return cachedProfile;
}

export function useRenderProfile(): RenderProfile {
  const [profile, setProfile] = useState<RenderProfile>(detectRenderProfile);

  useEffect(() => {
    // Dynamic FPS monitor — auto-downgrade profile if FPS remains low
    let frameCount = 0;
    let lastTime = performance.now();
    let lowFpsCount = 0;

    const interval = setInterval(() => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      const currentFps = frameCount / delta;
      frameCount = 0;
      lastTime = now;

      if (currentFps < 24 && currentFps > 0) {
        lowFpsCount++;
        if (lowFpsCount >= 3) {
          // Auto downgrade tier
          setProfile((prev) => {
            if (prev.tier === "high") {
              return { ...prev, tier: "medium", enablePostProcessing: false, particleMultiplier: 0.5 };
            }
            if (prev.tier === "medium") {
              return { ...prev, tier: "low", enableShadows: false, particleMultiplier: 0.2, fpsCap: 30 };
            }
            return prev;
          });
        }
      } else {
        lowFpsCount = 0;
      }
    }, 2000);

    const rafId = requestAnimationFrame(function count() {
      frameCount++;
      requestAnimationFrame(count);
    });

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return profile;
}
