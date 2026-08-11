"use client";

import { useState, type ReactNode } from "react";
import { LayoutGrid, Table2 } from "lucide-react";

import { cn } from "@/lib/cn";

type LeadsViewMode = "table" | "board";

type LeadsViewSwitcherProps = {
  tableView: ReactNode;
  boardView: ReactNode;
};

export default function LeadsViewSwitcher({
  tableView,
  boardView,
}: LeadsViewSwitcherProps) {
  const [viewMode, setViewMode] = useState<LeadsViewMode>("table");

  return (
    <div className="grid min-w-0 gap-4">
      <div className="flex justify-end">
        <div
          role="tablist"
          aria-label="Leads view"
          className="inline-flex rounded-lg border border-slate-300 bg-white p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "table"}
            onClick={() => setViewMode("table")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
              viewMode === "table"
                ? "bg-primary-900 text-white"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <Table2 aria-hidden="true" className="size-4" />
            Table
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "board"}
            onClick={() => setViewMode("board")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
              viewMode === "board"
                ? "bg-primary-900 text-white"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <LayoutGrid aria-hidden="true" className="size-4" />
            Board
          </button>
        </div>
      </div>

      {viewMode === "table" ? tableView : boardView}
    </div>
  );
}
