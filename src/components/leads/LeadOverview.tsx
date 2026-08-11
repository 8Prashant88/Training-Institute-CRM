import { Card, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import type { Lead } from "@/types/lead";

function OverviewItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}

export default function LeadOverview({ lead }: { lead: Lead }) {
  return (
    <Card>
      <CardContent>
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewItem label="Full name" value={lead.fullName} />
          <OverviewItem label="Email address" value={lead.email} />
          <OverviewItem label="Phone number" value={lead.phone} />
          <OverviewItem
            label="Interested course"
            value={lead.interestedCourse}
          />
          <OverviewItem label="Lead source" value={lead.source} />
          <OverviewItem label="Assigned counselor" value={lead.assignedTo} />
          <OverviewItem
            label="Created on"
            value={formatDate(lead.createdAt)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}
