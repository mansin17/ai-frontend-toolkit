import OpenAI from "openai";

// All three providers expose an OpenAI-compatible API, so a single SDK
// works for each of them — only the base URL, key and model differ.
export type Provider = "groq" | "gemini" | "openrouter";

interface ProviderConfig {
  baseURL: string;
  apiKeyEnv: string;
  modelEnv: string;
  defaultModel: string;
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  groq: {
    baseURL: "https://api.groq.com/openai/v1",
    apiKeyEnv: "GROQ_API_KEY",
    modelEnv: "GROQ_MODEL",
    defaultModel: "openai/gpt-oss-120b",
  },
  gemini: {
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKeyEnv: "GEMINI_API_KEY",
    modelEnv: "GEMINI_MODEL",
    defaultModel: "gemini-flash-latest",
  },
  openrouter: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKeyEnv: "OPENROUTER_API_KEY",
    modelEnv: "OPENROUTER_MODEL",
    // Routes to whichever free model is currently available.
    defaultModel: "openrouter/free",
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS) as Provider[];

export class MissingApiKeyError extends Error {
  constructor(provider: Provider) {
    super(
      `No API key configured for "${provider}". Add ${PROVIDERS[provider].apiKeyEnv} to server/.env and restart the server.`
    );
    this.name = "MissingApiKeyError";
  }
}

const clients = new Map<Provider, OpenAI>();

export function getClient(provider: Provider): OpenAI {
  const { baseURL, apiKeyEnv } = PROVIDERS[provider];
  const apiKey = process.env[apiKeyEnv];
  if (!apiKey) throw new MissingApiKeyError(provider);
  let client = clients.get(provider);
  if (!client) {
    client = new OpenAI({ apiKey, baseURL });
    clients.set(provider, client);
  }
  return client;
}

export function defaultModel(provider: Provider): string {
  const { modelEnv, defaultModel } = PROVIDERS[provider];
  return process.env[modelEnv] || defaultModel;
}

export function hasApiKey(provider: Provider): boolean {
  return Boolean(process.env[PROVIDERS[provider].apiKeyEnv]);
}

export function isProvider(value: unknown): value is Provider {
  return typeof value === "string" && value in PROVIDERS;
}

export const INVALID_PROVIDER_MESSAGE = `provider must be one of: ${PROVIDER_IDS.map((p) => `"${p}"`).join(", ")}`;
