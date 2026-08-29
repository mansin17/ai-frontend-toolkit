import { useState } from "react";
import { fetchRecommendations } from "../api/recommend";
import type { Provider, RecommendationItem } from "../types";

interface RecommendationsPanelProps {
  provider: Provider;
}

const EXAMPLES = ["streaming AI responses to the browser", "improving frontend performance", "database design"];

export function RecommendationsPanel({ provider }: RecommendationsPanelProps) {
  const [interests, setInterests] = useState("");
  const [items, setItems] = useState<RecommendationItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!interests.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchRecommendations(provider, interests));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Describe what you're interested in and the model ranks the best-matching articles from a 12-item mock
        catalog, returning structured JSON with a reason for each pick.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={interests}
          onChange={(event) => setInterests(event.target.value)}
          placeholder="e.g. streaming AI responses to the browser"
          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={!interests.trim() || loading}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-40"
        >
          {loading ? "Thinking…" : "Recommend"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setInterests(example)}
            className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-400 hover:border-emerald-500 hover:text-emerald-400"
          >
            {example}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {items && (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
              <h3 className="font-medium text-slate-100">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{item.description}</p>
              <p className="mt-2 text-xs text-emerald-400">Why: {item.reason}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
