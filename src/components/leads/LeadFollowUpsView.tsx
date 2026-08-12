import LeadTable from "@/components/leads/LeadTable";
import { Card, CardContent } from "@/components/ui/Card";
import type { LeadFollowUpResult } from "@/services/lead-followups-service";

type LeadFollowUpsViewProps = {
  followUps: LeadFollowUpResult;
};

export default function LeadFollowUpsView({
  followUps,
}: LeadFollowUpsViewProps) {
  return (
    <div className="grid min-w-0 gap-4">
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
