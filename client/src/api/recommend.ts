import type { Provider, RecommendationItem } from "../types";

export async function fetchRecommendations(
  provider: Provider,
  interests: string
): Promise<RecommendationItem[]> {
  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, interests }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Failed to fetch recommendations");
  return body.recommendations as RecommendationItem[];
}
