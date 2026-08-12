import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  UserCog,
  Users,
} from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
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
    href: "/dashboard/students",
    label: "Students",
    icon: GraduationCap,
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
  {
    href: "/dashboard/people",
    label: "People",
    icon: UserCog,
    adminOnly: true,
  },
];
