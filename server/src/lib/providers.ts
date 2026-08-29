import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type Provider = "openai" | "anthropic";

export class MissingApiKeyError extends Error {
  constructor(provider: Provider) {
    super(
      `No API key configured for "${provider}". Add ${
        provider === "openai" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY"
      } to server/.env and restart the server.`
    );
    this.name = "MissingApiKeyError";
  }
}

let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) throw new MissingApiKeyError("openai");
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new MissingApiKeyError("anthropic");
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

export const DEFAULT_MODELS: Record<Provider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-5",
};

export function isProvider(value: unknown): value is Provider {
  return value === "openai" || value === "anthropic";
}
