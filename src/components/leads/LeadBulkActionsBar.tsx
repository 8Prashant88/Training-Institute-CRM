"use client";

import { X } from "lucide-react";

import { Select } from "@/components/ui/Input";

import {
  leadStatusLabels,
  type LeadStatus,
} from "@/types/lead";

const bulkEditableStatuses:
  LeadStatus[] = [
    "NEW",
    "CONTACTED",
    "INTERESTED",
    "FOLLOW_UP",
    "LOST",
  ];

type LeadBulkActionsBarProps = {
  selectedCount: number;

  isUpdating?: boolean;

  onClearSelection: () => void;

  onChangeStatus: (
    status: LeadStatus,
  ) => void;
};

export default function LeadBulkActionsBar({
  selectedCount,
  isUpdating = false,
  onClearSelection,
  onChangeStatus,
}: LeadBulkActionsBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm font-medium text-primary-900">
        <button
          type="button"
          onClick={
            onClearSelection
          }
          disabled={isUpdating}
          aria-label="Clear selection"
          className="rounded-md p-1 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X
            aria-hidden="true"
            className="size-4"
          />
        </button>

        {selectedCount} lead
        {selectedCount === 1
          ? ""
          : "s"}{" "}
        selected
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          aria-label="Change status for selected leads"
          defaultValue=""
          disabled={isUpdating}
          onChange={(event) => {
            if (
              event.target.value
            ) {
              onChangeStatus(
                event.target
                  .value as LeadStatus,
              );

              event.target.value =
                "";
            }
          }}
          className="w-auto bg-white"
        >
          <option
            value=""
            disabled
          >
            {isUpdating
              ? "Updating…"
              : "Move to status…"}
          </option>

          {bulkEditableStatuses.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {
                  leadStatusLabels[
                    status
                  ]
                }
              </option>
            ),
          )}
        </Select>
      </div>
    </div>
  );
}