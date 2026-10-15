import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Positions a highlight behind the active item of a segmented control / tab bar.
 * Items must carry `data-key` matching `active`.
 */
export function useSlidingIndicator(active: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<{ left: number; width: number } | null>(null);
  // Skip the slide on first measure so the indicator doesn't fly in from the left on load.
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const item = container.querySelector<HTMLElement>(`[data-key="${active}"]`);
      if (item) setRect({ left: item.offsetLeft, width: item.offsetWidth });
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [active]);

  useLayoutEffect(() => {
    if (rect && !animate) {
      const frame = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(frame);
    }
  }, [rect, animate]);

  const indicatorStyle: CSSProperties = rect
    ? {
        width: rect.width,
        transform: `translateX(${rect.left}px)`,
        transition: animate ? "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), width 0.35s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
      }
    : { opacity: 0 };

  return { containerRef, indicatorStyle };
}
