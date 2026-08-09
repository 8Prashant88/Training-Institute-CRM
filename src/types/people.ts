export type PersonRole = "ADMIN" | "COUNSELOR";

export type Person = {
  id: string;
  fullName: string;
  email: string;
  role: PersonRole;
  isActive: boolean;
  hasLoginAccess: boolean;
  assignedLeadCount: number;
  createdAt: string;
};
