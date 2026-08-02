export type Batch = {
  id: string;
  name: string;
  course: string;
  schedule: string;
  instructor: string;
  students: number;
  capacity: number;
};

export const batches: Batch[] = [
  {
    id: "batch-001",
    name: "AI Engineering — Morning",
    course: "AI Engineering",
    schedule: "7:00 AM – 9:00 AM",
    instructor: "Anjali Gurung",
    students: 8,
    capacity: 10,
  },
  {
    id: "batch-002",
    name: "Data Science — Afternoon",
    course: "Data Science",
    schedule: "2:00 PM – 4:00 PM",
    instructor: "Bikash Karki",
    students: 10,
    capacity: 15,
  },
  {
    id: "batch-003",
    name: "Cybersecurity — Evening",
    course: "Cybersecurity",
    schedule: "5:00 PM – 7:00 PM",
    instructor: "Maya Rai",
    students: 12,
    capacity: 12,
  },
  {
    id: "batch-004",
    name: "Cloud & DevOps — Morning",
    course: "Cloud & DevOps",
    schedule: "8:00 AM – 10:00 AM",
    instructor: "Suresh Lama",
    students: 6,
    capacity: 12,
  },
  {
    id: "batch-005",
    name: "AI Engineering — Weekend",
    course: "AI Engineering",
    schedule: "Sat–Sun, 10:00 AM – 1:00 PM",
    instructor: "Maya Rai",
    students: 14,
    capacity: 14,
  },
];
