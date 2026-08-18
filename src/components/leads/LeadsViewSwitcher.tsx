"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";

export type LeadsViewMode = "table" | "board" | "followups";

type LeadsViewSwitcherProps = {
  view: LeadsViewMode;
  tableView: ReactNode;
  boardView: ReactNode;
  followUpsView: ReactNode;
};

const VIEW_OPTIONS: { key: LeadsViewMode; label: string }[] = [
  { key: "table", label: "Table view" },
  { key: "board", label: "Board view" },
  { key: "followups", label: "Follow-ups" },
];

export default function LeadsViewSwitcher({
  view,
  tableView,
  boardView,
  followUpsView,
}: LeadsViewSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigateToView(nextView: LeadsViewMode) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextView === "table") {
      params.delete("view");
    } else {
      params.set("view", nextView);
    }

    const query = params.toString();

    router.push(
      query ? `/dashboard/leads?${query}` : "/dashboard/leads",
    );
  }

  return (
    <div className="grid min-w-0 gap-4">
      <div
        role="tablist"
        aria-label="Leads view"
        className="flex gap-1 overflow-x-auto border-b border-slate-200"
      >
        {VIEW_OPTIONS.map((option) => {
          const isActive = option.key === view;

          return (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => navigateToView(option.key)}
              className={cn(
                "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2",
                isActive
                  ? "border-primary-900 text-primary-900"
                  : "border-transparent text-slate-500 hover:text-slate-800",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {view === "table" && tableView}
      {view === "board" && boardView}
      {view === "followups" && followUpsView}
    </div>
  );
}
