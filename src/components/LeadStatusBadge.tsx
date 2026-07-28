import type { LeadStatus } from "@/types/lead";

type LeadStatusBadgeProps = {
  status: LeadStatus;
};

export default function LeadStatusBadge({
  status,
}: LeadStatusBadgeProps) {
  return (
    <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
      {status}
    </span>
  );
}