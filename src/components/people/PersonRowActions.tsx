"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserX,
} from "lucide-react";

import { submitSetPersonActive } from "@/actions/set-person-active";
import { submitUpdatePersonRole } from "@/actions/update-person-role";
import { cn } from "@/lib/cn";
import type { Person } from "@/types/people";

type PersonRowActionsProps = {
  person: Person;
  isSelf: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export default function PersonRowActions({
  person,
  isSelf,
  onSuccess,
  onError,
}: PersonRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
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

  async function handleRoleToggle() {
    const nextRole = person.role === "ADMIN" ? "COUNSELOR" : "ADMIN";

    setOpen(false);
    setIsPending(true);

    try {
      const result = await submitUpdatePersonRole({
        personId: person.id,
        role: nextRole,
      });

      if (!result.success) {
        onError(result.message);
        return;
      }

      onSuccess(result.message);
    } catch (error) {
      console.error("Role change failed", error);
      onError("Unable to change this role right now. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleToggleActive() {
    setOpen(false);
    setIsPending(true);

    try {
      const result = await submitSetPersonActive({
        personId: person.id,
        isActive: !person.isActive,
      });

      if (!result.success) {
        onError(result.message);
        return;
      }

      onSuccess(result.message);
    } catch (error) {
      console.error("Status change failed", error);
      onError("Unable to update this person right now. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex justify-end">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${person.fullName}`}
        disabled={isPending}
        onClick={() => setOpen((current) => !current)}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MoreHorizontal aria-hidden="true" className="size-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[var(--shadow-popover)] animate-[var(--animate-fade-in)]"
        >
          <button
            type="button"
            role="menuitem"
            disabled={isSelf}
            onClick={handleRoleToggle}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {person.role === "ADMIN" ? (
              <UserCog aria-hidden="true" className="size-4" />
            ) : (
              <ShieldCheck aria-hidden="true" className="size-4" />
            )}
            Make {person.role === "ADMIN" ? "counselor" : "administrator"}
          </button>

          <button
            type="button"
            role="menuitem"
            disabled={isSelf}
            onClick={handleToggleActive}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50",
              person.isActive ? "text-red-600" : "text-green-700",
            )}
          >
            {person.isActive ? (
              <UserX aria-hidden="true" className="size-4" />
            ) : (
              <UserCheck aria-hidden="true" className="size-4" />
            )}
            {person.isActive ? "Deactivate" : "Reactivate"}
          </button>

          {isSelf && (
            <p className="px-2.5 py-1.5 text-xs text-slate-400">
              You can&apos;t change your own role or status.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
