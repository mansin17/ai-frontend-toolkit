import { useState } from "react";
import { ChatPanel } from "./components/ChatPanel";
import { ProviderToggle } from "./components/ProviderToggle";
import { RecommendationsPanel } from "./components/RecommendationsPanel";
import { SearchPanel } from "./components/SearchPanel";
import { TabNav, type TabId } from "./components/TabNav";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "./hooks/useTheme";
import type { Provider } from "./types";

export default function App() {
  const [tab, setTab] = useState<TabId>("chat");
  const [provider, setProvider] = useState<Provider>("groq");
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Soft drifting glow behind the content */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-96 w-96 animate-drift rounded-full bg-(--glow-a) blur-3xl" />
        <div
          className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] animate-drift rounded-full bg-(--glow-b) blur-3xl"
          style={{ animationDelay: "-11s" }}
        />
      </div>

      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10">
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex animate-fade-up items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 text-white shadow-lg shadow-emerald-500/20">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
                  <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zm7 12l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" />
                </svg>
              </span>
              <h1 className="text-2xl font-semibold tracking-tight">AI Frontend Toolkit</h1>
            </div>
            <p className="animate-fade-up text-sm text-muted [animation-delay:80ms]">
              Three AI-powered frontend patterns built on free LLM APIs (Groq, Gemini, OpenRouter): streaming chat
              over SSE, LLM-driven content recommendations, and intelligent natural-language search.
            </p>
          </div>
          <div className="animate-fade-in [animation-delay:200ms]">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        <div className="flex min-w-0 animate-fade-up flex-wrap items-center justify-between gap-3 [animation-delay:160ms]">
          <TabNav active={tab} onChange={setTab} />
          <ProviderToggle provider={provider} onChange={setProvider} />
        </div>

        {/* Keyed by tab so each panel animates in when switched to */}
        <main key={tab} className="min-w-0 animate-fade-up [animation-delay:60ms]">
          {tab === "chat" && <ChatPanel provider={provider} />}
          {tab === "recommend" && <RecommendationsPanel provider={provider} />}
          {tab === "search" && <SearchPanel provider={provider} />}
        </main>

        <footer className="mt-auto pt-8 text-center text-xs text-subtle">
          React + Vite frontend · Express backend proxy · streams via Server-Sent Events
        </footer>
      </div>
    </div>
  );
}
