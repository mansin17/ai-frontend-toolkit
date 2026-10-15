import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { completeJSON } from "../lib/jsonCompletion.js";
import { INVALID_PROVIDER_MESSAGE, MissingApiKeyError, isProvider } from "../lib/providers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalog: { id: string; title: string; tags: string[]; description: string }[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/catalog.json"), "utf-8")
);

interface RecommendResult {
  recommendations: { id: string; reason: string }[];
}

const router = Router();

router.post("/recommend", async (req, res) => {
  const { provider, model, interests } = req.body as {
    provider?: unknown;
    model?: string;
    interests?: string;
  };

  if (!isProvider(provider)) {
    res.status(400).json({ error: INVALID_PROVIDER_MESSAGE });
    return;
  }
  if (!interests || typeof interests !== "string" || !interests.trim()) {
    res.status(400).json({ error: "interests must be a non-empty string" });
    return;
  }

  const systemPrompt =
    "You are a content recommendation engine for a developer blog. " +
    'Given a catalog of articles and a reader\'s stated interests, return the 3 best-matching articles as JSON: ' +
    '{ "recommendations": [ { "id": string, "reason": string } ] }. ' +
    "Only use ids that exist in the catalog. Keep each reason under 20 words.";

  const userPrompt = `Catalog:\n${JSON.stringify(catalog)}\n\nReader interests: "${interests}"`;

  try {
    const result = await completeJSON<RecommendResult>(provider, model, systemPrompt, userPrompt);
    const byId = new Map(catalog.map((item) => [item.id, item]));
    const recommendations = (result.recommendations || [])
      .filter((r) => byId.has(r.id))
      .map((r) => ({ ...byId.get(r.id)!, reason: r.reason }));

    res.json({ recommendations });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("Recommend error:", err);
    res.status(502).json({ error: "Failed to generate recommendations." });
  }
});

export default router;
