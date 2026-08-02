import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { leadStatusLabels, leadStatuses, type Lead, type LeadStatus } from "@/types/lead";

const statusColors: Record<LeadStatus, string> = {
  NEW: "#2a78d6",
  CONTACTED: "#eb6834",
  INTERESTED: "#1baf7a",
  FOLLOW_UP: "#eda100",
  ENROLLED: "#008300",
  LOST: "#e34948",
};

export default function PipelineBreakdown({ leads }: { leads: Lead[] }) {
  const total = leads.length;

  const counts = leadStatuses.map((status) => ({
    status,
    count: leads.filter((lead) => lead.status === status).length,
  }));

  const maxCount = Math.max(1, ...counts.map((item) => item.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline breakdown</CardTitle>
        <CardDescription>
          How leads are distributed across every stage right now.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="grid gap-4">
          {counts.map(({ status, count }) => {
            const percentOfTotal = total > 0 ? Math.round((count / total) * 100) : 0;
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <li key={status}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">
                    {leadStatusLabels[status]}
                  </span>
                  <span className="shrink-0 tabular-nums text-slate-500">
                    {count} · {percentOfTotal}%
                  </span>
                </div>

                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-[width]"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: statusColors[status],
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
