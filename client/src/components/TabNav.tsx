import { useSlidingIndicator } from "../hooks/useSlidingIndicator";

export type TabId = "chat" | "recommend" | "search";

interface TabNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "chat", label: "Streaming Chat" },
  { id: "recommend", label: "Recommendations" },
  { id: "search", label: "Intelligent Search" },
];

export function TabNav({ active, onChange }: TabNavProps) {
  const { containerRef, indicatorStyle } = useSlidingIndicator(active);

  return (
    <nav ref={containerRef} className="relative flex min-w-0 max-w-full gap-1 overflow-x-auto [scrollbar-width:none] border-b border-line">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          data-key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
            active === tab.id ? "text-accent-ink" : "text-muted hover:text-fg"
          }`}
        >
          {tab.label}
        </button>
      ))}
      <span aria-hidden className="absolute bottom-0 left-0 h-0.5 rounded-full bg-accent" style={indicatorStyle} />
    </nav>
  );
}
