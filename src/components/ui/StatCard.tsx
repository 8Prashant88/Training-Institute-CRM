import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    direction: "up" | "down";
    value: string;
    label?: string;
  };
  className?: string;
};

export default function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <article
      className={cn(
        "min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>

        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-800">
            <Icon aria-hidden="true" className="size-5" />
          </span>
        )}
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-primary-900">
        {value}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              trend.direction === "up" ? "text-green-600" : "text-red-600",
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp aria-hidden="true" className="size-3.5" />
            ) : (
              <TrendingDown aria-hidden="true" className="size-3.5" />
            )}
            {trend.value}
          </span>
        )}

        {description && (
          <p className="truncate text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
    </article>
  );
}
