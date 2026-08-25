import { useState, useRef, useEffect } from 'react';
import { Z } from '@/styles/z-index';

export const AmbientGlowOverlay = () => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none)').matches;

  if (isTouchDevice) return null;

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{
        visibility: inView ? 'visible' : 'hidden',
        zIndex: Z.ambientGlow,
        background:
          'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--primary) / 0.045), transparent 70%)',
      }}
    />
  );
};
