import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center shadow-[var(--shadow-card)] sm:px-8">
      <div
        aria-hidden="true"
        className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-700"
      >
        <Icon className="size-6" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-primary-900">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
