"use client";
import { useState, type ReactNode } from "react";

interface Tab {
  key: string;
  label: string;
  content: ReactNode;
}

export function DashboardTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`border px-4 py-2 text-xs font-bold tracking-wide transition-colors ${
              active === t.key ? "border-cyan bg-cyan/10 text-cyan" : "border-line text-slate hover:border-cyan hover:text-cyan"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.key} className={active === t.key ? "block" : "hidden"}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
