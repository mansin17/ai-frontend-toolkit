import { useCallback, useState } from "react";
import { flushSync } from "react-dom";

export type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  // `origin` is the point the circular reveal grows from (usually the toggle button).
  const toggleTheme = useCallback(
    (origin?: { x: number; y: number }) => {
      const next: Theme = theme === "dark" ? "light" : "dark";
      const root = document.documentElement;

      const apply = () => {
        root.dataset.theme = next;
        flushSync(() => setTheme(next));
      };

      try {
        localStorage.setItem("theme", next);
      } catch {
        // Storage can be unavailable (private mode); the theme still applies for this visit.
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        apply();
        return;
      }

      if (!document.startViewTransition) {
        root.classList.add("theme-fade");
        apply();
        window.setTimeout(() => root.classList.remove("theme-fade"), 300);
        return;
      }

      const x = origin?.x ?? window.innerWidth / 2;
      const y = origin?.y ?? 0;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      root.style.setProperty("--reveal-x", `${x}px`);
      root.style.setProperty("--reveal-y", `${y}px`);
      root.style.setProperty("--reveal-r", `${radius}px`);
      document.startViewTransition(apply);
    },
    [theme]
  );

  return { theme, toggleTheme };
}
