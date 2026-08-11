"use client";

import { CalendarClock } from "lucide-react";

import { Select } from "@/components/ui/Input";
import { formatRelativeDate } from "@/lib/format";
import {
  leadStatusLabels,
  leadStatuses,
  type LeadStatus,
} from "@/types/lead";
import type { LeadPipelineCardData } from "@/services/lead-pipeline-service";

type LeadPipelineCardProps = {
  lead: LeadPipelineCardData;

  onRequestStatusChange: (
    lead: LeadPipelineCardData,
    targetStatus: LeadStatus,
  ) => void;
};

export default function LeadPipelineCard({
  lead,
  onRequestStatusChange,
}: LeadPipelineCardProps) {
  const isEnrolled = lead.status === "ENROLLED";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <a
        href={`/dashboard/leads/${lead.id}`}
        className="block truncate text-sm font-medium text-slate-900 hover:underline"
      >
        {lead.fullName}
      </a>

      <p className="mt-0.5 truncate text-xs text-slate-500">
        {lead.assignedTo}
      </p>

      {lead.nextFollowUpAt && (
        <p
          className="mt-2 flex items-center gap-1 text-xs text-slate-500"
          title={new Date(lead.nextFollowUpAt).toLocaleString()}
          suppressHydrationWarning
        >
          <CalendarClock aria-hidden="true" className="size-3.5" />
          {formatRelativeDate(lead.nextFollowUpAt)}
        </p>
      )}

      {!isEnrolled && (
        <Select
          aria-label={`Change status for ${lead.fullName}`}
          defaultValue=""
          className="mt-3 h-8 w-full bg-white text-xs"
          onChange={(event) => {
            const value = event.target.value as LeadStatus;

            if (value) {
              onRequestStatusChange(lead, value);
              event.target.value = "";
            }
          }}
        >
          <option value="" disabled>
            Move to…
          </option>

          {leadStatuses
            .filter(
              (status) =>
                status !== lead.status && status !== "ENROLLED",
            )
            .map((status) => (
              <option key={status} value={status}>
                {leadStatusLabels[status]}
              </option>
            ))}
        </Select>
      )}
    </div>
  );
}
