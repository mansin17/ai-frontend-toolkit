import { useRef, useState } from "react";
import { streamChat } from "../api/streamChat";
import type { ChatMessage, Provider } from "../types";

interface ChatPanelProps {
  provider: Provider;
}

export function ChatPanel({ provider }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChat({
        provider,
        messages: nextMessages,
        signal: controller.signal,
        onDelta: (delta) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = { ...last, content: last.content + delta };
            return updated;
          });
        },
      });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-[320px] flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            Ask a question below to see tokens stream in over Server-Sent Events as the model generates them.
          </p>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
              message.role === "user"
                ? "self-end bg-emerald-500 text-slate-950"
                : "self-start bg-slate-800 text-slate-100"
            }`}
          >
            {message.content || (isStreaming && index === messages.length - 1 ? "…" : "")}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about your product, code, or anything else…"
          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={handleStop}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-40"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}
