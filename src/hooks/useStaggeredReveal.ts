import { type RefObject, useEffect } from 'react';
import { gsap } from '@/hooks/use-gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useStaggeredReveal(
  containerRef: RefObject<HTMLElement>,
  stagger = 0.08
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll('[data-stagger]');
    if (!items.length) return;

    const ctx = gsap.context(() => {
      gsap.from(items, {
        y: 50,
        scale: 0.94,
        duration: 0.7,
        stagger,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          once: true,
        },
      });
    }, container);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
