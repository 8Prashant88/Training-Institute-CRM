import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  BookOpen,
  CalendarDays,
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
    href: "/dashboard/leads/follow-ups",
    label: "Follow-ups",
    icon: AlarmClock,
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
