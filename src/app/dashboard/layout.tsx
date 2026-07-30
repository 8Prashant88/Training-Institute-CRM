import Link from "next/link";
import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

const navigationLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/dashboard/leads",
    label: "Leads",
  },
  {
    href: "/dashboard/courses",
    label: "Courses",
  },
  {
    href: "/dashboard/batches",
    label: "Batches",
  },
];

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-800 bg-[#001B31]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/dashboard"
            className="min-w-0 text-base font-bold text-white focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9901C] sm:text-xl"
          >
            <span className="block truncate">
              Training Institute CRM
            </span>
          </Link>

          <Link
            href="/login"
            className="shrink-0 rounded-lg border border-white/30 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9901C]"
          >
            Logout
          </Link>
        </div>

        <nav
          aria-label="Mobile dashboard navigation"
          className="border-t border-white/10 px-4 py-3 md:hidden"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 sm:grid-cols-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg bg-white/10 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9901C]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden self-start rounded-xl bg-white p-4 shadow-sm md:block">
          <nav
            aria-label="Dashboard navigation"
            className="grid gap-2"
          >
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9901C]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}