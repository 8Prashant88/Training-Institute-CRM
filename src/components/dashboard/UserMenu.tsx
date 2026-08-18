"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { logout } from "@/actions/logout";

import Avatar from "@/components/ui/Avatar";

type DashboardUser = {
  fullName: string;
  email: string;
  role: "ADMIN" | "COUNSELOR";
};

type UserMenuProps = {
  currentUser: DashboardUser;
};

export default function UserMenu({ currentUser }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [logoutError, setLogoutError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  const roleLabel =
    currentUser.role === "ADMIN" ? "Administrator" : "Counselor";

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
  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const result = await logout();

      if (!result.success) {
        setLogoutError(result.message);
        return;
      }

      setOpen(false);

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout submission failed", error);

      setLogoutError("Unable to log out right now. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }
  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
      >
        <Avatar name={currentUser.fullName} size="sm" />

        <div className="hidden min-w-0 text-left md:block">
          <p className="max-w-36 truncate text-sm font-semibold text-slate-800">
            {currentUser.fullName}
          </p>

          <p className="text-xs text-slate-500">{roleLabel}</p>
        </div>

        <ChevronDown
          aria-hidden="true"
          className="hidden size-4 text-slate-500 sm:block"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[var(--shadow-popover)] animate-[var(--animate-fade-in)]"
        >
          <div className="flex items-start gap-3 rounded-lg p-2.5">
            <Avatar name={currentUser.fullName} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {currentUser.fullName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {currentUser.email}
              </p>

              <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {roleLabel}
              </span>
            </div>
          </div>

          <div className="my-1 h-px bg-slate-100" />

          {logoutError && (
  <p
    role="alert"
    className="px-2.5 py-2 text-xs leading-5 text-red-600"
  >
    {logoutError}
  </p>
)}

<button
  type="button"
  role="menuitem"
  disabled={isLoggingOut}
  onClick={handleLogout}
  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
>
  {isLoggingOut ? (
    <span
      aria-hidden="true"
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  ) : (
    <LogOut
      aria-hidden="true"
      className="size-4"
    />
  )}

  {isLoggingOut
    ? "Logging out..."
    : "Log out"}
</button>
        </div>
      )}
    </div>
  );
}
