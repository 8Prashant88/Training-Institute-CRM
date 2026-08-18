import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import LeadStatusBadge from "@/components/LeadStatusBadge";
import { formatRelativeDate } from "@/lib/format";
import type { Lead } from "@/types/lead";

type LeadCardProps = {
  lead: Lead;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
};

export default function LeadCard({
  lead,
  selected = false,
  onToggleSelect,
}: LeadCardProps) {
  return (
    <article className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex min-w-0 items-start gap-3">
        {onToggleSelect && (
          <input
            type="checkbox"
            aria-label={`Select ${lead.fullName}`}
            checked={selected}
            onChange={() => onToggleSelect(lead.id)}
            className="mt-1 size-4 shrink-0 rounded border-slate-300 text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
          />
        )}

        <Avatar name={lead.fullName} />

        <Link
          href={`/dashboard/leads/${lead.id}`}
          className="min-w-0 flex-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
        >
          <h2 className="truncate text-base font-semibold text-slate-900">
            {lead.fullName}
          </h2>
          <p className="truncate text-sm text-slate-500">{lead.email}</p>
        </Link>

        <div className="shrink-0">
          <LeadStatusBadge status={lead.status} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-slate-400">Course</dt>
          <dd className="truncate font-medium text-slate-700">
            {lead.interestedCourse}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-xs text-slate-400">Assigned to</dt>
          <dd className="truncate font-medium text-slate-700">
            {lead.assignedTo}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-xs text-slate-400">Source</dt>
          <dd className="truncate font-medium text-slate-700">
            {lead.source}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="text-xs text-slate-400">Added</dt>
          <dd
            className="truncate font-medium text-slate-700"
            suppressHydrationWarning
          >
            {formatRelativeDate(lead.createdAt)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
        <a
          href={`mailto:${lead.email}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <Mail aria-hidden="true" className="size-4" />
          Email
        </a>
        <a
          href={`tel:${lead.phone}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <Phone aria-hidden="true" className="size-4" />
          Call
        </a>
      </div>
    </article>
  );
}
