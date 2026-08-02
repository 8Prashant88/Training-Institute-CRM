import type { Metadata } from "next";
import { BookOpen, Layers, Users } from "lucide-react";

import Badge from "@/components/ui/Badge";
import { Card, CardEyebrow } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { courses } from "@/data/courses";
import { leads } from "@/data/leads";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Courses",
};

export default function CoursesPage() {
  const activeCourses = courses.filter((course) => course.active).length;
  const totalEnrolled = leads.filter(
    (lead) => lead.status === "ENROLLED",
  ).length;

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <CardEyebrow>Course management</CardEyebrow>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
          Courses
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          View the training programs offered by the institute and how leads
          are converting into enrollments.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total courses" value={courses.length} icon={BookOpen} />
        <StatCard label="Active courses" value={activeCourses} icon={Layers} />
        <StatCard label="Total enrolled" value={totalEnrolled} icon={Users} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const courseLeads = leads.filter(
            (lead) => lead.interestedCourse === course.name,
          );
          const enrolled = courseLeads.filter(
            (lead) => lead.status === "ENROLLED",
          ).length;

          return (
            <Card key={course.id} className="flex flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {course.category}
                  </p>
                  <h2 className="mt-1 truncate text-lg font-semibold text-primary-900">
                    {course.name}
                  </h2>
                </div>

                <Badge tone={course.active ? "green" : "slate"}>
                  {course.active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-slate-400">Duration</dt>
                  <dd className="mt-0.5 font-medium text-slate-700">
                    {course.duration}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Fee</dt>
                  <dd className="mt-0.5 font-medium text-slate-700">
                    {formatCurrency(course.fee)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Interested leads</dt>
                  <dd className="mt-0.5 font-medium text-slate-700">
                    {courseLeads.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Enrolled</dt>
                  <dd className="mt-0.5 font-medium text-slate-700">
                    {enrolled}
                  </dd>
                </div>
              </dl>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
