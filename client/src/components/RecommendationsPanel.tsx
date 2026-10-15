import { useState } from "react";
import { fetchRecommendations } from "../api/recommend";
import type { Provider, RecommendationItem } from "../types";
import { ErrorMessage, SkeletonCard, Spinner, cardClass, chipClass, inputClass, primaryButtonClass } from "./ui";

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
      <p className="text-sm text-subtle">
        Describe what you're interested in and the model ranks the best-matching articles from a 12-item mock
        catalog, returning structured JSON with a reason for each pick.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={interests}
          onChange={(event) => setInterests(event.target.value)}
          placeholder="e.g. streaming AI responses to the browser"
          className={inputClass}
        />
        <button type="submit" disabled={!interests.trim() || loading} className={primaryButtonClass}>
          {loading && <Spinner />}
          {loading ? "Thinking…" : "Recommend"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button key={example} type="button" onClick={() => setInterests(example)} className={chipClass}>
            {example}
          </button>
        ))}
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} delay={i * 100} />
          ))}
        </div>
      ) : (
        items && (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`${cardClass} animate-fade-up`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <h3 className="font-medium text-fg">{item.title}</h3>
                <p className="mt-1 text-sm text-muted">{item.description}</p>
                <p className="mt-2 text-xs text-accent-ink">Why: {item.reason}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
