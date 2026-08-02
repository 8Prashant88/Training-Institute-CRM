export type Course = {
  id: string;
  name: string;
  category: string;
  duration: string;
  fee: number;
  active: boolean;
};

export const courses: Course[] = [
  {
    id: "course-001",
    name: "AI Engineering",
    category: "Artificial Intelligence",
    duration: "12 weeks",
    fee: 85000,
    active: true,
  },
  {
    id: "course-002",
    name: "Data Science",
    category: "Data & Analytics",
    duration: "12 weeks",
    fee: 80000,
    active: true,
  },
  {
    id: "course-003",
    name: "Cybersecurity",
    category: "Security",
    duration: "16 weeks",
    fee: 95000,
    active: true,
  },
  {
    id: "course-004",
    name: "Cloud & DevOps",
    category: "Infrastructure",
    duration: "10 weeks",
    fee: 75000,
    active: true,
  },
  {
    id: "course-005",
    name: "UI/UX Design",
    category: "Design",
    duration: "8 weeks",
    fee: 60000,
    active: false,
  },
];
