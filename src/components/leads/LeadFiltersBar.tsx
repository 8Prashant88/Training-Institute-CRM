"use client";

import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import SearchInput from "@/components/ui/SearchInput";
import { cn } from "@/lib/cn";
import {
  leadSources,
  leadStatusLabels,
  leadStatuses,
  type LeadSource,
  type LeadStatus,
} from "@/types/lead";

export type StatusFilter = "ALL" | LeadStatus;

type LeadFiltersBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  statusCounts: Record<StatusFilter, number>;
  sourceFilter: "ALL" | LeadSource;
  onSourceChange: (value: "ALL" | LeadSource) => void;
  onAddLead: () => void;
};

export default function LeadFiltersBar({
  query,
  onQueryChange,
  statusFilter,
  onStatusChange,
  statusCounts,
  sourceFilter,
  onSourceChange,
  onAddLead,
}: LeadFiltersBarProps) {
  const statusPills: StatusFilter[] = ["ALL", ...leadStatuses];

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by name, email, phone, or course…"
          containerClassName="w-full sm:max-w-sm"
          aria-label="Search leads"
        />

        <div className="flex shrink-0 items-center gap-2">
          <Select
            value={sourceFilter}
            onChange={(event) =>
              onSourceChange(event.target.value as "ALL" | LeadSource)
            }
            aria-label="Filter by source"
            className="w-auto"
          >
            <option value="ALL">All sources</option>
            {leadSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </Select>

          <Button onClick={onAddLead} className="whitespace-nowrap">
            <Plus aria-hidden="true" className="size-4" />
            Add lead
          </Button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Filter leads by status"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {statusPills.map((status) => {
          const isActive = statusFilter === status;

          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onStatusChange(status)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
                isActive
                  ? "border-primary-900 bg-primary-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {status === "ALL" ? "All" : leadStatusLabels[status]}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {statusCounts[status]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
