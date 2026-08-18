"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tab = {
  key: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
};

export default function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [activeKey, setActiveKey] = useState(
    defaultTab ?? tabs[0]?.key,
  );

  const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Lead sections"
        className="flex gap-1 overflow-x-auto border-b border-slate-200"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab?.key;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.key}`}
              onClick={() => setActiveKey(tab.key)}
              className={cn(
                "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2",
                isActive
                  ? "border-primary-900 text-primary-900"
                  : "border-transparent text-slate-500 hover:text-slate-800",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`tabpanel-${tab.key}`}
          aria-labelledby={`tab-${tab.key}`}
          hidden={tab.key !== activeTab?.key}
          className="pt-6"
        >
          {tab.key === activeTab?.key && tab.content}
        </div>
      ))}
    </div>
  );
}
