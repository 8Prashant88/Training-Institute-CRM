import Link from "next/link";
import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="text-xl font-bold text-slate-900"
          >
            Training Institute CRM
          </Link>

          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Logout
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl bg-white p-4 shadow-sm">
          <nav className="grid gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/leads"
              className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Leads
            </Link>

            <Link
              href="/dashboard/courses"
              className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Courses
            </Link>

            <Link
              href="/dashboard/batches"
              className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Batches
            </Link>
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}