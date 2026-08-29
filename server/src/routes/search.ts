import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { completeJSON } from "../lib/jsonCompletion.js";
import { MissingApiKeyError, isProvider } from "../lib/providers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataset: { id: string; title: string; content: string }[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/searchDataset.json"), "utf-8")
);

interface SearchResult {
  summary: string;
  matches: { id: string; relevance: string }[];
}

const router = Router();

router.post("/search", async (req, res) => {
  const { provider, model, query } = req.body as {
    provider?: unknown;
    model?: string;
    query?: string;
  };

  if (!isProvider(provider)) {
    res.status(400).json({ error: 'provider must be "openai" or "anthropic"' });
    return;
  }
  if (!query || typeof query !== "string" || !query.trim()) {
    res.status(400).json({ error: "query must be a non-empty string" });
    return;
  }

  const systemPrompt =
    "You are an intelligent search engine over a small internal knowledge base of engineering postmortems and notes. " +
    "Given a natural-language query and a list of documents, find the documents that actually answer or relate to the query " +
    '(even if they don\'t share exact keywords), and write a short synthesized answer. Return JSON: ' +
    '{ "summary": string, "matches": [ { "id": string, "relevance": string } ] }. ' +
    "Only include documents that are genuinely relevant (0 to 5 matches). Only use ids that exist in the dataset. " +
    "Keep each relevance note under 20 words, and the summary under 60 words.";

  const userPrompt = `Documents:\n${JSON.stringify(dataset)}\n\nQuery: "${query}"`;

  try {
    const result = await completeJSON<SearchResult>(provider, model, systemPrompt, userPrompt);
    const byId = new Map(dataset.map((doc) => [doc.id, doc]));
    const matches = (result.matches || [])
      .filter((m) => byId.has(m.id))
      .map((m) => ({ ...byId.get(m.id)!, relevance: m.relevance }));

    res.json({ summary: result.summary || "", matches });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("Search error:", err);
    res.status(502).json({ error: "Failed to run search." });
  }
});

export default router;
