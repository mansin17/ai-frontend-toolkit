import { useEffect, useRef, useState } from "react";
import { streamChat } from "../api/streamChat";
import type { ChatMessage, Provider } from "../types";
import { ErrorMessage, TypingDots, inputClass, primaryButtonClass } from "./ui";

interface ChatPanelProps {
  provider: Provider;
}

export function ChatPanel({ provider }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest tokens in view as they stream in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

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
      <div
        ref={scrollRef}
        className="flex h-[420px] flex-col gap-3 overflow-y-auto rounded-2xl border border-line bg-surface/70 p-4 shadow-sm backdrop-blur"
      >
        {messages.length === 0 && (
          <div className="m-auto flex max-w-xs animate-fade-in flex-col items-center gap-3 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent-ink">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5m-9 6l3-3h11a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v13z" />
              </svg>
            </span>
            <p className="text-sm text-subtle">
              Ask a question below to see tokens stream in over Server-Sent Events as the model generates them.
            </p>
          </div>
        )}
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          const isLiveReply = isStreaming && isLast && message.role === "assistant";
          return (
            <div
              key={index}
              className={`max-w-[85%] animate-pop-in rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap shadow-sm ${
                message.role === "user"
                  ? "self-end origin-bottom-right rounded-br-md bg-accent text-accent-fg"
                  : "self-start origin-bottom-left rounded-bl-md border border-line bg-surface-2 text-fg"
              }`}
            >
              {message.content ? (
                <>
                  {message.content}
                  {isLiveReply && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-blink bg-current" aria-hidden />
                  )}
                </>
              ) : (
                isLiveReply && <TypingDots />
              )}
            </div>
          );
        })}
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about your product, code, or anything else…"
          className={inputClass}
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={handleStop}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm font-medium text-fg transition-all duration-200 hover:border-danger hover:text-danger active:scale-95"
          >
            <span className="h-2.5 w-2.5 rounded-sm bg-current" aria-hidden />
            Stop
          </button>
        ) : (
          <button type="submit" disabled={!input.trim()} className={primaryButtonClass}>
            Send
          </button>
        )}
      </form>
    </div>
  );
}
