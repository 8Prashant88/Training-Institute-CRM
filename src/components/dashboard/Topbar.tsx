"use client";

import { Bell, Menu, Search } from "lucide-react";

import UserMenu from "@/components/dashboard/UserMenu";

type TopbarProps = {
  onOpenMobileNav: () => void;
};

export default function Topbar({ onOpenMobileNav }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
        className="-ml-1.5 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 lg:hidden"
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
            className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-primary-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          />
        </div>
      </form>

      <button
        type="button"
        aria-label="Notifications"
        className="relative shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <Bell aria-hidden="true" className="size-5" />
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent-500 ring-2 ring-white"
        />
      </button>

      <UserMenu />
    </header>
  );
}
