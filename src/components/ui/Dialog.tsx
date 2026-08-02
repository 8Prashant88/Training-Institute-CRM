"use client";

import { useEffect, type ReactNode } from "react";

import { cn } from "@/lib/cn";

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
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

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
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6",
          sizeClasses[size],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
