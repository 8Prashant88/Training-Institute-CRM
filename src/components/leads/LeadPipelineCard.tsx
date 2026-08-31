"use client";

import { AlertTriangle, CalendarClock } from "lucide-react";

import LeadFavoriteToggle from "@/components/leads/LeadFavoriteToggle";
import Badge from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { formatRelativeDate } from "@/lib/format";
import { leadPriorityTones } from "@/lib/lead-status";
import { isFollowUpOverdue } from "@/lib/lead-status-rules";
import {
  leadPriorityLabels,
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

  const overdue = isFollowUpOverdue(lead.status, lead.nextFollowUpAt);

  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-3 shadow-sm",
        overdue ? "border-red-200" : "border-slate-200",
      )}
    >
      <div className="flex items-center gap-1">
        <a
          href={`/dashboard/leads/${lead.id}`}
          className="block min-w-0 flex-1 truncate text-sm font-medium text-slate-900 hover:underline"
        >
          {lead.fullName}
        </a>

        {lead.priority && (
          <Badge
            tone={leadPriorityTones[lead.priority]}
            className="shrink-0 px-1.5 py-0 text-[10px]"
          >
            {leadPriorityLabels[lead.priority]}
          </Badge>
        )}

        <LeadFavoriteToggle
          leadId={lead.id}
          leadName={lead.fullName}
          isFavorited={Boolean(lead.isFavorited)}
          className="-mr-1.5 shrink-0 p-1"
        />
      </div>

      <p className="mt-0.5 truncate text-xs text-slate-500">
        {lead.assignedTo}
      </p>

      {lead.nextFollowUpAt && (
        <p
          className={cn(
            "mt-2 flex items-center gap-1 text-xs font-medium",
            overdue ? "text-red-600" : "text-slate-500",
          )}
          title={new Date(lead.nextFollowUpAt).toLocaleString()}
          suppressHydrationWarning
        >
          {overdue ? (
            <AlertTriangle aria-hidden="true" className="size-3.5" />
          ) : (
            <CalendarClock aria-hidden="true" className="size-3.5" />
          )}
          {overdue ? "Overdue · " : ""}
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
