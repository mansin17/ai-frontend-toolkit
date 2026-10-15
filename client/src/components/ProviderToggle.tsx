import { useSlidingIndicator } from "../hooks/useSlidingIndicator";
import type { Provider } from "../types";

interface ProviderToggleProps {
  provider: Provider;
  onChange: (provider: Provider) => void;
}

const OPTIONS: { value: Provider; label: string }[] = [
  { value: "groq", label: "Groq" },
  { value: "gemini", label: "Gemini" },
  { value: "openrouter", label: "OpenRouter" },
];

export function ProviderToggle({ provider, onChange }: ProviderToggleProps) {
  const { containerRef, indicatorStyle } = useSlidingIndicator(provider);

  return (
    <div ref={containerRef} className="relative inline-flex rounded-xl border border-line bg-surface p-1 shadow-sm">
      <span aria-hidden className="absolute top-1 bottom-1 left-0 rounded-lg bg-accent shadow-sm" style={indicatorStyle} />
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          data-key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-300 active:scale-95 ${
            provider === option.value ? "text-accent-fg" : "text-muted hover:text-fg"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
