import Badge, { type BadgeTone } from "@/components/ui/Badge";
import { leadStatusLabels, type LeadStatus } from "@/types/lead";

type LeadStatusBadgeProps = {
  status: LeadStatus;
  className?: string;
};

const statusTones: Record<LeadStatus, BadgeTone> = {
  NEW: "blue",
  CONTACTED: "violet",
  INTERESTED: "amber",
  FOLLOW_UP: "orange",
  ENROLLED: "green",
  LOST: "red",
};

export default function LeadStatusBadge({
  status,
  className,
}: LeadStatusBadgeProps) {
  return (
    <Badge tone={statusTones[status]} dot className={className}>
      {leadStatusLabels[status]}
    </Badge>
  );
}
