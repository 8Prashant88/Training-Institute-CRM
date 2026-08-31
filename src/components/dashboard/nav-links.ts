import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarClock,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  UserCog,
  Users,
} from "lucide-react";

export type NavSection = "Pipeline" | "Operations" | "Admin";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  section: NavSection;
  adminOnly?: boolean;
};

export const navSectionOrder: NavSection[] = [
  "Pipeline",
  "Operations",
  "Admin",
];

export const navigationLinks: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "Pipeline",
  },
  {
    href: "/dashboard/leads",
    label: "Leads",
    icon: Users,
    section: "Pipeline",
  },
  {
    href: "/dashboard/leads/follow-ups",
    label: "Follow-ups",
    icon: CalendarClock,
    section: "Pipeline",
  },
  {
    href: "/dashboard/students",
    label: "Students",
    icon: GraduationCap,
    section: "Operations",
  },
  {
    href: "/dashboard/courses",
    label: "Courses",
    icon: BookOpen,
    section: "Operations",
  },
  {
    href: "/dashboard/batches",
    label: "Batches",
    icon: CalendarDays,
    section: "Operations",
  },
  {
    href: "/dashboard/people",
    label: "People",
    icon: UserCog,
    section: "Admin",
    adminOnly: true,
  },
];
