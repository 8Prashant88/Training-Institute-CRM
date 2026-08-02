"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";

import Avatar from "@/components/ui/Avatar";

const currentUser = {
  name: "Counselor Admin",
  email: "counselor@traininginstitute.example",
};

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <Avatar name={currentUser.name} size="sm" />
        <ChevronDown
          aria-hidden="true"
          className="hidden size-4 text-slate-500 sm:block"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[var(--shadow-popover)] animate-[var(--animate-fade-in)]"
        >
          <div className="flex items-center gap-3 rounded-lg p-2.5">
            <Avatar name={currentUser.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {currentUser.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="my-1 h-px bg-slate-100" />

          <Link
            href="/login"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-red-600 transition hover:bg-red-50"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Log out
          </Link>
        </div>
      )}
    </div>
  );
}
