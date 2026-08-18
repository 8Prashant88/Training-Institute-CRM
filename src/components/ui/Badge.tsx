import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type BadgeTone =
  | "slate"
  | "blue"
  | "violet"
  | "cyan"
  | "amber"
  | "orange"
  | "green"
  | "red";

const toneClasses: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-600/10",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/10",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/10",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-600/10",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/10",
  orange: "bg-accent-50 text-accent-800 ring-accent-600/15",
  green: "bg-green-50 text-green-700 ring-green-600/10",
  red: "bg-red-50 text-red-700 ring-red-600/10",
};

type BadgeProps = {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
};

export default function Badge({
  tone = "slate",
  dot = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      )}
      {children}
    </span>
  );
}
