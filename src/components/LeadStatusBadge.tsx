import Badge from "@/components/ui/Badge";
import { leadStatusTones } from "@/lib/lead-status";
import { leadStatusLabels, type LeadStatus } from "@/types/lead";

type LeadStatusBadgeProps = {
  status: LeadStatus;
  className?: string;
};

export default function LeadStatusBadge({
  status,
  className,
}: LeadStatusBadgeProps) {
  return (
    <Badge tone={leadStatusTones[status]} dot className={className}>
      {leadStatusLabels[status]}
    </Badge>
  );
}
