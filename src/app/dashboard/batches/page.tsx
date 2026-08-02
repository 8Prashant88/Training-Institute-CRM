import type { Metadata } from "next";
import { CalendarDays, Users } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { Card, CardEyebrow } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { batches } from "@/data/batches";

export const metadata: Metadata = {
  title: "Batches",
};

export default function BatchesPage() {
  const totalStudents = batches.reduce(
    (total, batch) => total + batch.students,
    0,
  );
  const totalCapacity = batches.reduce(
    (total, batch) => total + batch.capacity,
    0,
  );

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <CardEyebrow>Batch management</CardEyebrow>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
          Batches
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          View schedules, instructors, capacity, and student occupancy
          across every running batch.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Running batches" value={batches.length} icon={CalendarDays} />
        <StatCard label="Enrolled students" value={totalStudents} icon={Users} />
        <StatCard
          label="Overall occupancy"
          value={`${Math.round((totalStudents / totalCapacity) * 100)}%`}
          icon={Users}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {batches.map((batch) => {
          const isFull = batch.students >= batch.capacity;
          const occupancy = Math.round(
            (batch.students / batch.capacity) * 100,
          );

          return (
            <Card key={batch.id} className="flex flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-primary-900">
                    {batch.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {batch.course}
                  </p>
                </div>

                <Badge tone={isFull ? "red" : "green"}>
                  {isFull ? "Full" : "Open"}
                </Badge>
              </div>

              <p className="mt-4 text-sm text-slate-600">
                Schedule: {batch.schedule}
              </p>

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Avatar name={batch.instructor} size="sm" />
                {batch.instructor}
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Occupancy</span>
                  <span className="font-medium tabular-nums text-slate-800">
                    {batch.students}/{batch.capacity}
                  </span>
                </div>

                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      isFull ? "bg-red-500" : "bg-primary-800"
                    }`}
                    style={{ width: `${occupancy}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
