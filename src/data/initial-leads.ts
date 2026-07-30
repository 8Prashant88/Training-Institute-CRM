import type { Lead } from "@/types/lead";

export const initialLeads: Lead[] = [
  {
    id: "lead-001",
    fullName: "Prashant Sapkota",
    email: "prashant@example.com",
    phone: "9800000000",
    interestedCourse: "AI Engineering",
    status: "NEW",
  },
  {
    id: "lead-002",
    fullName: "Sita Sharma",
    email: "sita@example.com",
    phone: "9800000001",
    interestedCourse: "Data Science",
    status: "ENROLLED",
  },
  {
    id: "lead-003",
    fullName: "Rohan Thapa",
    email: "rohan@example.com",
    phone: "9800000002",
    interestedCourse: "Cybersecurity",
    status: "ENROLLED",
  },
];