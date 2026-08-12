import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { LeadSource } from "@/types/lead";

export type LeadSourceBreakdown = {
  source: LeadSource;
  count: number;
};

type LeadsBySourceProps = {
  breakdown: LeadSourceBreakdown[];
};

export default function LeadsBySource({ breakdown }: LeadsBySourceProps) {
  const total = breakdown.reduce((sum, row) => sum + row.count, 0);
  const maxCount = Math.max(1, ...breakdown.map((row) => row.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads by source</CardTitle>

        <CardDescription>
          Where inquiries are coming from, ranked by volume.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-slate-500">No leads yet.</p>
        ) : (
          <ul className="grid gap-4">
            {breakdown.map(({ source, count }) => {
              const percentOfTotal =
                total > 0 ? Math.round((count / total) * 100) : 0;
              const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

              return (
                <li key={source}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">
                      {source}
                    </span>

                    <span className="shrink-0 tabular-nums text-slate-500">
                      {count} · {percentOfTotal}%
                    </span>
                  </div>

                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-accent-500 transition-[width]"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
