import { Router } from "express";
import {
  DEFAULT_MODELS,
  MissingApiKeyError,
  getAnthropic,
  getOpenAI,
  isProvider,
} from "../lib/providers.js";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const router = Router();

function sendEvent(res: import("express").Response, data: unknown) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

router.post("/chat", async (req, res) => {
  const { provider, model, messages } = req.body as {
    provider?: unknown;
    model?: string;
    messages?: ChatMessage[];
  };

  if (!isProvider(provider)) {
    res.status(400).json({ error: 'provider must be "openai" or "anthropic"' });
    return;
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages must be a non-empty array" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const chosenModel = model || DEFAULT_MODELS[provider];

  try {
    if (provider === "openai") {
      const client = getOpenAI();
      const stream = await client.chat.completions.create({
        model: chosenModel,
        messages,
        stream: true,
      });
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) sendEvent(res, { delta });
      }
    } else {
      const client = getAnthropic();
      const stream = client.messages.stream({
        model: chosenModel,
        max_tokens: 1024,
        messages,
      });
      stream.on("text", (delta) => sendEvent(res, { delta }));
      await stream.finalMessage();
    }
    sendEvent(res, { done: true });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      sendEvent(res, { error: err.message });
    } else {
      console.error("Chat stream error:", err);
      sendEvent(res, {
        error: err instanceof Error ? err.message : "Unexpected error while streaming the response.",
      });
    }
  } finally {
    res.end();
  }
});

export default router;
