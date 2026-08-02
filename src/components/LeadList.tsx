import type { Lead } from "@/types/lead";
import EmptyState from "@/components/EmptyState";
import LeadCard from "@/components/LeadCard";

type LeadListProps = {
  leads: Lead[];
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
};

export default function LeadList({
  leads,
  selectedIds,
  onToggleSelect,
}: LeadListProps) {
  if (leads.length === 0) {
    return (
      <EmptyState
        title="No leads found"
        description="No inquiries match the current filters. Try a different search or clear the filters."
      />
    );
  }

  return (
    <div className="grid w-full min-w-0 gap-4">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          selected={selectedIds?.has(lead.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
