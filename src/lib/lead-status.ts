import type { BadgeTone } from "@/components/ui/Badge";
import type { LeadPriority, LeadStatus } from "@/types/lead";


export const leadStatusTones: Record<LeadStatus, BadgeTone> = {
  NEW: "blue",
  CONTACTED: "violet",
  INTERESTED: "cyan",
  FOLLOW_UP: "amber",
  ENROLLED: "green",
  LOST: "red",
};

export const leadPriorityTones: Record<LeadPriority, BadgeTone> = {
  HOT: "red",
  WARM: "amber",
  COLD: "cyan",
};
