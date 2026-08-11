import type { Metadata } from "next";
import { redirect } from "next/navigation";

import LeadCounselorFilterSelect from "@/components/leads/LeadCounselorFilterSelect";
import LeadTable from "@/components/leads/LeadTable";
import { Card, CardContent, CardEyebrow } from "@/components/ui/Card";

import { isAdmin } from "@/lib/authorization";

import { listLeadFollowUps } from "@/services/lead-followups-service";

import {
  getCurrentAuthenticatedUser,
  listCounselorsForLeadFilters,
} from "@/services/user-service";

export const metadata: Metadata = {
  title: "Follow-ups",
};

type FollowUpsPageProps = {
  searchParams: Promise<{ counselor?: string }>;
};

export default async function FollowUpsPage({
  searchParams,
}: FollowUpsPageProps) {
  const { counselor } = await searchParams;

  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    redirect("/login");
  }

  const canManageAssignments = isAdmin(currentUser);

  const [followUps, counselorFilterOptions] = await Promise.all([
    listLeadFollowUps(currentUser, {
      counselorId: canManageAssignments ? counselor : undefined,
    }),

    canManageAssignments
      ? listCounselorsForLeadFilters()
      : Promise.resolve([]),
  ]);

  return (
    <div className="grid min-w-0 gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <CardEyebrow>Daily worklist</CardEyebrow>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
          Follow-ups
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {canManageAssignments
            ? "Every lead due for a follow-up today or overdue, across all counselors."
            : "Your leads due for a follow-up today or overdue."}
        </p>

        {canManageAssignments && (
          <div className="mt-4">
            <LeadCounselorFilterSelect
              basePath="/dashboard/leads/follow-ups"
              counselors={counselorFilterOptions}
              selectedCounselorId={counselor}
            />
          </div>
        )}
      </section>

      <Card>
        <CardContent className="border-b border-slate-100">
          <h2 className="text-base font-semibold text-red-700">
            Overdue ({followUps.overdue.length})
          </h2>
        </CardContent>

        {followUps.overdue.length > 0 ? (
          <LeadTable leads={followUps.overdue} selectable={false} />
        ) : (
          <p className="px-5 pb-5 text-sm text-slate-500 sm:px-6">
            Nothing overdue.
          </p>
        )}
      </Card>

      <Card>
        <CardContent className="border-b border-slate-100">
          <h2 className="text-base font-semibold text-amber-700">
            Due today ({followUps.today.length})
          </h2>
        </CardContent>

        {followUps.today.length > 0 ? (
          <LeadTable leads={followUps.today} selectable={false} />
        ) : (
          <p className="px-5 pb-5 text-sm text-slate-500 sm:px-6">
            Nothing due today.
          </p>
        )}
      </Card>
    </div>
  );
}
