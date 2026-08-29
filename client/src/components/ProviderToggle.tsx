import type { Provider } from "../types";

interface ProviderToggleProps {
  provider: Provider;
  onChange: (provider: Provider) => void;
}

const OPTIONS: { value: Provider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
];

export function ProviderToggle({ provider, onChange }: ProviderToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            provider === option.value
              ? "bg-emerald-500 text-slate-950"
              : "text-slate-400 hover:text-slate-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
