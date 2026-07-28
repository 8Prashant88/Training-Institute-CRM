export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "FOLLOW_UP"
  | "ENROLLED"
  | "LOST";

export type Lead = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  interestedCourse: string;
  status: LeadStatus;
};  