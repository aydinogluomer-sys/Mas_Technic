/* Session/local storage that never throws. Storage can be blocked (private
   mode, site-data policy, sandboxed frames); a blocked write simply is not
   remembered and a blocked read returns null. */
type Area = "localStorage" | "sessionStorage";

function area(name: Area): Storage | null {
  try {
    return window[name];
  } catch {
    return null;
  }
}

function make(name: Area) {
  return {
    get(key: string): string | null {
      try { return area(name)?.getItem(key) ?? null; } catch { return null; }
    },
    set(key: string, value: string): void {
      try { area(name)?.setItem(key, value); } catch { /* blocked or full */ }
    },
    remove(key: string): void {
      try { area(name)?.removeItem(key); } catch { /* blocked */ }
    },
  };
}

export const safeLocal = make("localStorage");
export const safeSession = make("sessionStorage");
