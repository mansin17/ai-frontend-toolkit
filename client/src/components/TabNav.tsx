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
  return (
    <nav className="flex gap-1 border-b border-slate-800">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            active === tab.id
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
