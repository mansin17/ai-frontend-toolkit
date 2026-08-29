import type { ChatMessage, Provider } from "../types";

interface StreamChatArgs {
  provider: Provider;
  messages: ChatMessage[];
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}

/**
 * POSTs to /api/chat and reads the text/event-stream response manually.
 * EventSource can't send a POST body, so this parses the SSE framing
 * ("data: {...}\n\n") straight out of the fetch response stream.
 */
export async function streamChat({ provider, messages, onDelta, signal }: StreamChatArgs): Promise<void> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, messages }),
    signal,
  });

  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Chat request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const line = event.trim();
      if (!line.startsWith("data:")) continue;
      const payload = JSON.parse(line.slice(5).trim());
      if (payload.error) throw new Error(payload.error);
      if (payload.delta) onDelta(payload.delta);
    }
  }
}
