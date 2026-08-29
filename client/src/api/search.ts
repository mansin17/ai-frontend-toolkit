import type { Provider, SearchMatch } from "../types";

interface SearchResponse {
  summary: string;
  matches: SearchMatch[];
}

export async function runSearch(provider: Provider, query: string): Promise<SearchResponse> {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, query }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Failed to run search");
  return body as SearchResponse;
}
