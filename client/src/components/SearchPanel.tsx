import { useState } from "react";
import { runSearch } from "../api/search";
import type { Provider, SearchMatch } from "../types";

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
      <p className="text-sm text-slate-500">
        Ask a question in plain language. The model reads a 15-doc internal knowledge base, finds documents that
        actually answer the question (not just keyword matches), and synthesizes a short answer.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. why did checkout get slow?"
          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-40"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setQuery(example)}
            className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-400 hover:border-emerald-500 hover:text-emerald-400"
          >
            {example}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {summary && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-100">
          {summary}
        </div>
      )}

      {matches && (
        <div className="flex flex-col gap-3">
          {matches.length === 0 && <p className="text-sm text-slate-500">No relevant documents found.</p>}
          {matches.map((match) => (
            <div key={match.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
              <h3 className="font-medium text-slate-100">{match.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{match.content}</p>
              <p className="mt-2 text-xs text-emerald-400">Relevance: {match.relevance}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
