import type { Lead } from "@/types/lead";
import LeadStatusBadge from "@/components/LeadStatusBadge";

type LeadCardProps = {
  lead: Lead;
};

export default function LeadCard({
  lead,
}: LeadCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {lead.fullName}
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            {lead.email}
          </p>

          <p className="text-sm text-slate-600">
            {lead.phone}
          </p>
        </div>

        <LeadStatusBadge status={lead.status} />
      </div>

      <p className="mt-4 text-sm text-slate-700">
        Interested course:{" "}
        <span className="font-medium">
          {lead.interestedCourse}
        </span>
      </p>
    </article>
  );
}