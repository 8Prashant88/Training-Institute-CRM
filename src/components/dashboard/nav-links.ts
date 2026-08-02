import type { LucideIcon } from "lucide-react";
import { BookOpen, CalendarDays, LayoutDashboard, Users } from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navigationLinks: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/leads",
    label: "Leads",
    icon: Users,
  },
  {
    href: "/dashboard/courses",
    label: "Courses",
    icon: BookOpen,
  },
  {
    href: "/dashboard/batches",
    label: "Batches",
    icon: CalendarDays,
  },
];
