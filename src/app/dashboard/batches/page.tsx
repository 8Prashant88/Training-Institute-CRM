import type { Metadata } from "next";
import { CalendarDays, GraduationCap, Users } from "lucide-react";

import Badge, { type BadgeTone } from "@/components/ui/Badge";
import { Card, CardEyebrow } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import type { BatchStatus } from "@/generated/prisma/client";
import { formatDate } from "@/lib/format";
import { listBatches } from "@/services/batch-service";
import CreateBatchForm from "@/components/batches/CreateBatchForm";
import { listActiveCourses } from "@/services/course-service";

export const metadata: Metadata = {
  title: "Batches",
};

const batchStatusDetails: Record<
  BatchStatus,
  {
    label: string;
    tone: BadgeTone;
  }
> = {
  UPCOMING: {
    label: "Upcoming",
    tone: "blue",
  },
  ONGOING: {
    label: "Ongoing",
    tone: "green",
  },
  COMPLETED: {
    label: "Completed",
    tone: "slate",
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "red",
  },
};

export default async function BatchesPage() {
  const [batches, courses] = await Promise.all([
    listBatches(),
    listActiveCourses(),
  ]);

  const activeBatches = batches.filter(
    (batch) => batch.status === "UPCOMING" || batch.status === "ONGOING",
  );

  const totalEnrollments = batches.reduce(
    (total, batch) => total + batch.enrolledCount,
    0,
  );

  const activeCapacity = activeBatches.reduce(
    (total, batch) => total + batch.capacity,
    0,
  );

  const activeEnrollments = activeBatches.reduce(
    (total, batch) => total + batch.enrolledCount,
    0,
  );

  const overallOccupancy =
    activeCapacity > 0
      ? Math.round((activeEnrollments / activeCapacity) * 100)
      : 0;

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <CardEyebrow>Batch management</CardEyebrow>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
          Batches
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          View batch dates, course information, capacity, enrollment totals, and
          current status.
        </p>
      </section>
      

      <section
        aria-label="Batch statistics"
        className="grid gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Active batches"
          value={activeBatches.length}
          icon={CalendarDays}
          description="Upcoming and ongoing"
        />

        <StatCard
          label="Total enrollments"
          value={totalEnrollments}
          icon={GraduationCap}
          description="Excluding cancelled enrollments"
        />

        <StatCard
          label="Active occupancy"
          value={`${overallOccupancy}%`}
          icon={Users}
          description="Across active batches"
        />
      </section>
      <CreateBatchForm
        courses={courses.map((course) => ({
          id: course.id,
          title: course.title,
          duration: course.duration,
        }))}
      />
      

      {batches.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-primary-900">
            No batches found
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Create a batch in the database to display it here.
          </p>
        </section>
      ) : (
        <section
          aria-label="Batches"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {batches.map((batch) => {
            const statusDetails = batchStatusDetails[batch.status];

            const occupancy =
              batch.capacity > 0
                ? Math.round((batch.enrolledCount / batch.capacity) * 100)
                : 0;

            const occupancyBarWidth = Math.min(occupancy, 100);

            const isFull =
              batch.capacity > 0 && batch.enrolledCount >= batch.capacity;

            return (
              <Card key={batch.id} className="flex flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-primary-900">
                      {batch.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {batch.courseTitle}
                    </p>
                  </div>

                  <Badge tone={statusDetails.tone}>{statusDetails.label}</Badge>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      Start date
                    </dt>

                    <dd className="mt-1 font-medium text-slate-700">
                      {formatDate(batch.startDate)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      End date
                    </dt>

                    <dd className="mt-1 font-medium text-slate-700">
                      {formatDate(batch.endDate)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-500">Occupancy</span>

                    <span className="font-medium tabular-nums text-slate-800">
                      {batch.enrolledCount}/{batch.capacity}
                      {isFull ? " · Full" : ""}
                    </span>
                  </div>

                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        isFull ? "bg-red-500" : "bg-primary-800"
                      }`}
                      style={{
                        width: `${occupancyBarWidth}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1.5 text-right text-xs text-slate-400">
                    {occupancy}% occupied
                  </p>
                  
       
                </div>
              </Card>
            );
          })}
        </section>
        
      )}
    </div>
  );
}
