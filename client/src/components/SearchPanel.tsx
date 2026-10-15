import { useState } from "react";
import { runSearch } from "../api/search";
import type { Provider, SearchMatch } from "../types";
import { ErrorMessage, SkeletonCard, Spinner, cardClass, chipClass, inputClass, primaryButtonClass } from "./ui";

interface SearchPanelProps {
  provider: Provider;
}

const EXAMPLES = ["why did checkout get slow?", "how do we avoid duplicate payments?"];

export function SearchPanel({ provider }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [matches, setMatches] = useState<SearchMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await runSearch(provider, query);
      setSummary(result.summary);
      setMatches(result.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-subtle">
        Ask a question in plain language. The model reads a 15-doc internal knowledge base, finds documents that
        actually answer the question (not just keyword matches), and synthesizes a short answer.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. why did checkout get slow?"
          className={inputClass}
        />
        <button type="submit" disabled={!query.trim() || loading} className={primaryButtonClass}>
          {loading && <Spinner />}
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button key={example} type="button" onClick={() => setQuery(example)} className={chipClass}>
            {example}
          </button>
        ))}
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton mt-2 h-3 w-4/5" />
          </div>
          {[0, 1].map((i) => (
            <SkeletonCard key={i} delay={100 + i * 100} />
          ))}
        </div>
      ) : (
        <>
          {summary && (
            <div className="flex animate-fade-up gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-fg">
              <svg viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden>
                <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2z" />
              </svg>
              <p>{summary}</p>
            </div>
          )}

          {matches && (
            <div className="flex flex-col gap-3">
              {matches.length === 0 && <p className="animate-fade-in text-sm text-subtle">No relevant documents found.</p>}
              {matches.map((match, index) => (
                <div
                  key={match.id}
                  className={`${cardClass} animate-fade-up`}
                  style={{ animationDelay: `${120 + index * 90}ms` }}
                >
                  <h3 className="font-medium text-fg">{match.title}</h3>
                  <p className="mt-1 text-sm text-muted">{match.content}</p>
                  <p className="mt-2 text-xs text-accent-ink">Relevance: {match.relevance}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
