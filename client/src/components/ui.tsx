import type { ReactNode } from "react";

export const inputClass =
  "flex-1 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-fg shadow-sm outline-none transition-all duration-200 placeholder:text-subtle focus:border-accent focus:ring-4 focus:ring-accent/15";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg shadow-sm transition-all duration-200 hover:brightness-110 hover:shadow-md hover:shadow-accent/20 active:scale-95 disabled:pointer-events-none disabled:opacity-40";

export const chipClass =
  "rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent-ink active:scale-95";

export const cardClass =
  "rounded-xl border border-line bg-surface/70 p-4 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5";

export function Spinner() {
  return (
    <span
      aria-hidden
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Assistant is typing">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-dot rounded-full bg-current"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="animate-shake rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
    >
      {children}
    </p>
  );
}

export function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div className="animate-fade-in rounded-xl border border-line bg-surface/70 p-4" style={{ animationDelay: `${delay}ms` }}>
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton mt-3 h-3 w-full" />
      <div className="skeleton mt-2 h-3 w-5/6" />
      <div className="skeleton mt-4 h-3 w-1/3" />
    </div>
  );
}
