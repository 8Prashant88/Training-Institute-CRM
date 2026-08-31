export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "FOLLOW_UP"
  | "ENROLLED"
  | "LOST";

export const leadStatuses: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "ENROLLED",
  "LOST",
];

export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  FOLLOW_UP: "Follow-up",
  ENROLLED: "Enrolled",
  LOST: "Lost",
};

export type LeadSource =
  | "Website"
  | "Referral"
  | "Walk-in"
  | "Social Media"
  | "Phone Inquiry"
  | "Event";

export const leadSources: LeadSource[] = [
  "Website",
  "Referral",
  "Walk-in",
  "Social Media",
  "Phone Inquiry",
  "Event",
];

export type LeadPriority = "HOT" | "WARM" | "COLD";

export const leadPriorities: LeadPriority[] = ["HOT", "WARM", "COLD"];

export const leadPriorityLabels: Record<LeadPriority, string> = {
  HOT: "Hot",
  WARM: "Warm",
  COLD: "Cold",
};

export type LeadTag = {
  id: string;
  name: string;
};

export type Lead = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  interestedCourse: string;
  status: LeadStatus;
  source: LeadSource;
  assignedTo: string;
  createdAt: string;

  nextFollowUpAt?: string | null;
  priority?: LeadPriority | null;
  tags?: LeadTag[];
  isFavorited?: boolean;
};