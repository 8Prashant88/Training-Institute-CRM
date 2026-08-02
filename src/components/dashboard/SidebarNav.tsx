"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { navigationLinks } from "@/components/dashboard/nav-links";

type SidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
};

export default function SidebarNav({
  onNavigate,
  className,
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard navigation"
      className={cn("grid gap-1", className)}
    >
      {navigationLinks.map((link) => {
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
              "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
              isActive
                ? "border-accent-500 bg-primary-50 text-primary-900"
                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <Icon
              aria-hidden="true"
              className={cn(
                "size-5 shrink-0",
                isActive ? "text-primary-900" : "text-slate-400",
              )}
            />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
