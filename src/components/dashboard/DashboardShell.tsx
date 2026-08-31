"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

import SidebarNav from "@/components/dashboard/SidebarNav";

import Topbar from "@/components/dashboard/Topbar";

import { cn } from "@/lib/cn";

type DashboardUser = {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: "ADMIN" | "COUNSELOR";
};

function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 text-sm font-bold text-white shadow-[0_2px_8px_-2px_rgb(224_116_15/0.6)]"
      >
        SA
      </span>

      <span className="min-w-0">
        <span
          className={cn(
            "block truncate text-sm font-bold leading-tight",
            dark ? "text-white" : "text-primary-900",
          )}
        >
          Saarathi Academy
        </span>
        <span
          className={cn(
            "block text-[11px] font-semibold uppercase tracking-widest",
            dark ? "text-accent-400" : "text-accent-700",
          )}
        >
          CRM Platform
        </span>
      </span>
    </Link>
  );
}

export default function DashboardShell({
  children,
  currentUser,
  initialUnreadCount,
}: {
  children: ReactNode;
  currentUser: DashboardUser;
  initialUnreadCount: number;
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
    <div className="flex min-h-screen">
      <aside className="app-sidebar hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-black/10">
        <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
          <BrandMark dark />
        </div>

        <SidebarNav
          role={currentUser.role}
          className="flex-1 overflow-y-auto px-2.5 py-4"
        />

        <div className="border-t border-white/10 p-4 text-xs text-slate-400">
          Saarathi Academy CRM — Nepal region
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

          <div className="app-sidebar relative flex h-full w-72 max-w-[85vw] flex-col shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
              <BrandMark dark />

              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <SidebarNav
              role={currentUser.role}
              onNavigate={() => setMobileNavOpen(false)}
              className="flex-1 overflow-y-auto px-2.5 py-4"
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          currentUser={currentUser}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          initialUnreadCount={initialUnreadCount}
        />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px] min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
