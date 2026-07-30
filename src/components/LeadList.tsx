import type { Lead } from "@/types/lead";
import EmptyState from "@/components/EmptyState";
import LeadCard from "@/components/LeadCard";

type LeadListProps = {
  leads: Lead[];
};

export default function LeadList({
  leads,
}: LeadListProps) {
  if (leads.length === 0) {
    return (
      <EmptyState
        title="No leads found"
        description="No inquiries match the selected status. Choose another filter or add a new lead."
      />
    );
  }

  return (
    <div className="grid w-full min-w-0 gap-4">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}