import { useState } from "react";
import { ChatPanel } from "./components/ChatPanel";
import { ProviderToggle } from "./components/ProviderToggle";
import { RecommendationsPanel } from "./components/RecommendationsPanel";
import { SearchPanel } from "./components/SearchPanel";
import { TabNav, type TabId } from "./components/TabNav";
import type { Provider } from "./types";

export default function App() {
  const [tab, setTab] = useState<TabId>("chat");
  const [provider, setProvider] = useState<Provider>("openai");

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">AI Frontend Toolkit</h1>
        <p className="text-sm text-slate-400">
          Three AI-powered frontend patterns built on OpenAI &amp; Anthropic: streaming chat over SSE,
          LLM-driven content recommendations, and intelligent natural-language search.
        </p>
      </header>

      <div className="flex items-center justify-between">
        <TabNav active={tab} onChange={setTab} />
        <ProviderToggle provider={provider} onChange={setProvider} />
      </div>

      <main>
        {tab === "chat" && <ChatPanel provider={provider} />}
        {tab === "recommend" && <RecommendationsPanel provider={provider} />}
        {tab === "search" && <SearchPanel provider={provider} />}
      </main>

      <footer className="mt-auto pt-8 text-center text-xs text-slate-600">
        React + Vite frontend · Express backend proxy · streams via Server-Sent Events
      </footer>
    </div>
  );
}
