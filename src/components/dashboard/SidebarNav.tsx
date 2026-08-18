"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { navigationLinks } from "@/components/dashboard/nav-links";

type SidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
  role?: "ADMIN" | "COUNSELOR";
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
      className={cn("grid content-start gap-0.5", className)}
    >
      <p className="px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Menu
      </p>

      {visibleLinks.map((link) => {
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
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600",
              isActive
                ? "bg-primary-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
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
    </nav>
  );
}
