import type { Lead } from "@/types/lead";
import LeadStatusBadge from "@/components/LeadStatusBadge";

type LeadCardProps = {
  lead: Lead;
};

export default function LeadCard({
  lead,
}: LeadCardProps) {
  return (
    <article className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-lg font-semibold text-slate-900">
            {lead.fullName}
          </h2>

          <p className="mt-1 break-all text-sm text-slate-600">
            {lead.email}
          </p>

          <p className="mt-1 break-words text-sm text-slate-600">
            {lead.phone}
          </p>
        </div>

        <div className="shrink-0">
          <LeadStatusBadge status={lead.status} />
        </div>
      </div>

      <p className="mt-4 break-words text-sm leading-6 text-slate-700">
        Interested course:{" "}
        <span className="font-medium">
          {lead.interestedCourse}
        </span>
      </p>
    </article>
  );
}