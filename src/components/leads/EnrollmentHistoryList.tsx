import Badge, { type BadgeTone } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { EnrollmentStatus } from "@/generated/prisma/client";

type EnrollmentHistoryItem = {
  id: string;
  batchTitle: string;
  courseTitle: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  droppedAt: string | null;
  dropReason: string | null;
};

const statusDetails: Record<
  EnrollmentStatus,
  { label: string; tone: BadgeTone }
> = {
  ACTIVE: { label: "Active", tone: "green" },
  COMPLETED: { label: "Completed", tone: "blue" },
  CANCELLED: { label: "Cancelled", tone: "slate" },
  DROPPED: { label: "Dropped", tone: "red" },
};

export default function EnrollmentHistoryList({
  enrollments,
}: {
  enrollments: EnrollmentHistoryItem[];
}) {
  if (enrollments.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <h2 className="text-sm font-semibold text-primary-900">
        Past enrollments
      </h2>

      <ul className="mt-4 grid gap-3">
        {enrollments.map((enrollment) => {
          const details = statusDetails[enrollment.status];

          return (
            <li
              key={enrollment.id}
              className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">
                    {enrollment.batchTitle}
                  </p>

                  <p className="text-xs text-slate-500">
                    {enrollment.courseTitle}
                  </p>
                </div>

                <Badge tone={details.tone}>{details.label}</Badge>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Enrolled {formatDate(enrollment.enrolledAt)}
                {enrollment.droppedAt
                  ? ` · Dropped ${formatDate(enrollment.droppedAt)}`
                  : ""}
              </p>

              {enrollment.dropReason && (
                <p className="mt-1 text-xs italic leading-5 text-slate-500">
                  “{enrollment.dropReason}”
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
