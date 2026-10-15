export type Provider = "groq" | "gemini" | "openrouter";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  tags: string[];
  description: string;
  reason: string;
}

export interface SearchMatch {
  id: string;
  title: string;
  content: string;
  relevance: string;
}
