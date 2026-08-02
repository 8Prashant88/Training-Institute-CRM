"use client";

import { Trash2, X } from "lucide-react";

import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import {
  leadStatusLabels,
  leadStatuses,
  type LeadStatus,
} from "@/types/lead";

type LeadBulkActionsBarProps = {
  selectedCount: number;
  onClearSelection: () => void;
  onChangeStatus: (status: LeadStatus) => void;
  onDelete: () => void;
};

export default function LeadBulkActionsBar({
  selectedCount,
  onClearSelection,
  onChangeStatus,
  onDelete,
}: LeadBulkActionsBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm font-medium text-primary-900">
        <button
          type="button"
          onClick={onClearSelection}
          aria-label="Clear selection"
          className="rounded-md p-1 transition hover:bg-primary-100"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
        {selectedCount} lead{selectedCount === 1 ? "" : "s"} selected
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          aria-label="Change status for selected leads"
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) {
              onChangeStatus(event.target.value as LeadStatus);
              event.target.value = "";
            }
          }}
          className="w-auto bg-white"
        >
          <option value="" disabled>
            Move to status…
          </option>
          {leadStatuses.map((status) => (
            <option key={status} value={status}>
              {leadStatusLabels[status]}
            </option>
          ))}
        </Select>

        <Button variant="danger" size="sm" onClick={onDelete}>
          <Trash2 aria-hidden="true" className="size-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
