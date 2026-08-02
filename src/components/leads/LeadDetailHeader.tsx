"use client";

import { useState } from "react";
import { Mail, Phone } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";
import {
  leadStatusLabels,
  leadStatuses,
  type Lead,
  type LeadStatus,
} from "@/types/lead";

export default function LeadDetailHeader({ lead }: { lead: Lead }) {
  const { toast } = useToast();
  const [status, setStatus] = useState<LeadStatus>(lead.status);

  function handleStatusChange(nextStatus: LeadStatus) {
    setStatus(nextStatus);

    toast({
      variant: "success",
      title: "Status updated",
      description: `${lead.fullName} is now marked as ${leadStatusLabels[nextStatus]}.`,
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar name={lead.fullName} size="lg" />

          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold text-primary-900 sm:text-3xl">
              {lead.fullName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>Lead ID: {lead.id}</span>
              <span>·</span>
              <span>Added {formatDate(lead.createdAt)}</span>
              <span>·</span>
              <span>Source: {lead.source}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="slate">Assigned to {lead.assignedTo}</Badge>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <label className="text-xs font-medium text-slate-500" htmlFor="lead-status">
            Pipeline status
          </label>
          <Select
            id="lead-status"
            value={status}
            onChange={(event) =>
              handleStatusChange(event.target.value as LeadStatus)
            }
            className="w-full bg-white sm:w-48"
          >
            {leadStatuses.map((option) => (
              <option key={option} value={option}>
                {leadStatusLabels[option]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
        <a
          href={`mailto:${lead.email}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Mail aria-hidden="true" className="size-4" />
          {lead.email}
        </a>

        <a
          href={`tel:${lead.phone}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Phone aria-hidden="true" className="size-4" />
          {lead.phone}
        </a>
      </div>
    </div>
  );
}
