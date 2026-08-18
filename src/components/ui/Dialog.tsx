"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type DialogSize = "sm" | "md" | "lg";

const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

type DialogProps = {
  open: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId?: string;
  size?: DialogSize;
  className?: string;
  children: ReactNode;
};

export default function Dialog({
  open,
  onClose,
  titleId,
  descriptionId,
  size = "sm",
  className,
  children,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (!panelRef.current.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const autoFocused = panelRef.current?.querySelector<HTMLElement>("[autofocus]");
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      FOCUSABLE_SELECTOR,
    );

    (autoFocused ?? firstFocusable ?? panelRef.current)?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 animate-[var(--animate-fade-in)]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(
          "relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-xl outline-none sm:p-6",
          sizeClasses[size],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
