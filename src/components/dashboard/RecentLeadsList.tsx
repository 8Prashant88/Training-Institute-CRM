import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import LeadStatusBadge from "@/components/LeadStatusBadge";
import { formatRelativeDate } from "@/lib/format";
import type { Lead } from "@/types/lead";

/**
 * `leads` is expected to already be the 5 most recent, sorted newest
 * first — dashboard-service.ts fetches exactly that with `take: 5` and
 * `orderBy: { createdAt: "desc" }` rather than this component sorting
 * and slicing a full lead list handed to it.
 */
export default function RecentLeadsList({ leads }: { leads: Lead[] }) {
  const recentLeads = leads;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Recent leads</CardTitle>
            <CardDescription>Newest inquiries first.</CardDescription>
          </div>

          <Link
            href="/dashboard/leads"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary-800 transition hover:text-primary-900"
          >
            View all
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </CardHeader>

      <CardContent padded={false}>
        <ul className="divide-y divide-slate-100">
          {recentLeads.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/dashboard/leads/${lead.id}`}
                className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50 sm:px-6"
              >
                <Avatar name={lead.fullName} size="sm" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {lead.fullName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {lead.interestedCourse}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <LeadStatusBadge status={lead.status} />
                  <span
                    className="text-xs text-slate-400"
                    suppressHydrationWarning
                  >
                    {formatRelativeDate(lead.createdAt)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
