import type { Lead } from "@/types/lead";
import LeadCard from "@/components/LeadCard";

type LeadListProps = {
  leads: Lead[];
};

export default function LeadList({
  leads,
}: LeadListProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="font-medium text-slate-900">
          No leads found
        </p>

        <p className="mt-1 text-sm text-slate-600">
          New inquiries will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}