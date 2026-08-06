"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

import SidebarNav from "@/components/dashboard/SidebarNav";

import Topbar from "@/components/dashboard/Topbar";

type DashboardUser = {
  fullName: string;
  email: string;
  role: "ADMIN" | "COUNSELOR";
};

function BrandMark() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-900 text-sm font-bold text-white"
      >
        TI
      </span>

      <span className="min-w-0">
        <span className="block truncate text-sm font-bold leading-tight text-primary-900">
          Training Institute
        </span>
        <span className="block text-[11px] font-semibold uppercase tracking-widest text-accent-600">
          CRM Platform
        </span>
      </span>
    </Link>
  );
}

export default function DashboardShell({
  children,
  currentUser,
}: {
  children: ReactNode;
  currentUser: DashboardUser;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
        <div className="flex h-16 shrink-0 items-center border-b border-slate-100 px-5">
          <BrandMark />
        </div>

        <SidebarNav className="flex-1 overflow-y-auto px-3 py-4" />

        <div className="border-t border-slate-100 p-4 text-xs text-slate-400">
          Training Institute CRM — Nepal region
        </div>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-slate-950/60 animate-[var(--animate-fade-in)]"
          />

          <div className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4">
              <BrandMark />

              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <SidebarNav
              onNavigate={() => setMobileNavOpen(false)}
              className="flex-1 overflow-y-auto px-3 py-4"
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          currentUser={currentUser}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
