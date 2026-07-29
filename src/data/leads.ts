export type SampleLead = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  course: string;
  status: "NEW" | "CONTACTED" | "ENROLLED";
};

export const leads: SampleLead[] = [
  {
    id: "lead-001",
    fullName: "Prashant Sapkota",
    email: "prashant@example.com",
    phone: "9800000000",
    course: "AI Engineering",
    status: "NEW",
  },
  {
    id: "lead-002",
    fullName: "Sita Sharma",
    email: "sita@example.com",
    phone: "9800000001",
    course: "Data Science",
    status: "CONTACTED",
  },
  {
    id: "lead-003",
    fullName: "Rohan Thapa",
    email: "rohan@example.com",
    phone: "9800000002",
    course: "Cybersecurity",
    status: "ENROLLED",
  },
];