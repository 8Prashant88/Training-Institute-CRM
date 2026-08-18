"use client";

import { Menu, Search } from "lucide-react";

import NotificationsMenu from "@/components/dashboard/NotificationsMenu";
import UserMenu from "@/components/dashboard/UserMenu";

type TopbarProps = {
  currentUser: DashboardUser;
  onOpenMobileNav: () => void;
  initialUnreadCount: number;
};

type DashboardUser = {
  fullName: string;
  email: string;
  role: "ADMIN" | "COUNSELOR";
};

export default function Topbar({
  currentUser,
  onOpenMobileNav,
  initialUnreadCount,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
        className="-ml-1.5 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      <form
        action="/dashboard/leads"
        method="get"
        role="search"
        className="min-w-0 flex-1"
      >
        <div className="relative max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />
          <label htmlFor="global-search" className="sr-only">
            Search leads by name, email, or course
          </label>
          <input
            id="global-search"
            name="q"
            type="search"
            placeholder="Search leads by name, email, or course…"
            className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-primary-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-600/40"
          />
        </div>
      </form>

      <NotificationsMenu initialUnreadCount={initialUnreadCount} />

     <UserMenu currentUser={currentUser} />
    </header>
  );
}
