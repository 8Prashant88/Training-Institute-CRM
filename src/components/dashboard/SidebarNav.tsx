"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import {
  navigationLinks,
  navSectionOrder,
  type NavSection,
} from "@/components/dashboard/nav-links";

type SidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
  role?: "ADMIN" | "COUNSELOR";
};

const sectionLabels: Record<NavSection, string> = {
  Pipeline: "Pipeline",
  Operations: "Operations",
  Admin: "Admin",
};

export default function SidebarNav({
  onNavigate,
  className,
  role,
}: SidebarNavProps) {
  const pathname = usePathname();

  const visibleLinks = navigationLinks.filter(
    (link) => !link.adminOnly || role === "ADMIN",
  );

  return (
    <nav
      aria-label="Dashboard navigation"
      className={cn("grid content-start gap-5", className)}
    >
      {navSectionOrder.map((section) => {
        const links = visibleLinks.filter(
          (link) => link.section === section,
        );

        if (links.length === 0) {
          return null;
        }

        return (
          <div key={section} className="grid gap-0.5">
            <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {sectionLabels[section]}
            </p>

            {links.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
                    isActive
                      ? "bg-accent-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "size-4 shrink-0",
                      isActive ? "text-white" : "text-slate-400",
                    )}
                  />
                  {link.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
