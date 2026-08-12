"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Select } from "@/components/ui/Input";

export type LeadsViewMode = "table" | "board" | "followups";

type LeadsViewSwitcherProps = {
  view: LeadsViewMode;
  tableView: ReactNode;
  boardView: ReactNode;
  followUpsView: ReactNode;
};

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
      <div className="flex justify-end">
        <label htmlFor="leads-view-select" className="sr-only">
          Leads view
        </label>

        <Select
          id="leads-view-select"
          value={view}
          className="w-auto bg-white"
          onChange={(event) =>
            navigateToView(event.target.value as LeadsViewMode)
          }
        >
          <option value="table">Table view</option>
          <option value="board">Board view</option>
          <option value="followups">Follow-ups</option>
        </Select>
      </div>

      {view === "table" && tableView}
      {view === "board" && boardView}
      {view === "followups" && followUpsView}
    </div>
  );
}
