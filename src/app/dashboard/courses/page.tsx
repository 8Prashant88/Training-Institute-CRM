import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import Badge from "@/components/ui/Badge";
import { Card, CardEyebrow } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import CreateCourseForm from "@/components/courses/CreateCourseForm";
import CourseManagementCard from "@/components/courses/CourseManagementCard";
import {
  listActiveCourses,
  listCoursesForManagement,
} from "@/services/course-service";
import { isAdmin } from "@/lib/authorization";

import { getCurrentAuthenticatedUser } from "@/services/user-service";

export const metadata: Metadata = {
  title: "Courses",
};

export default async function CoursesPage() {
  const currentUser = await getCurrentAuthenticatedUser();
  const canManageCourses = currentUser ? isAdmin(currentUser) : false;

  const managedCourses = canManageCourses
    ? await listCoursesForManagement()
    : null;

  const activeOnlyCourses = canManageCourses ? null : await listActiveCourses();

  const activeCourseCount = managedCourses
    ? managedCourses.filter((course) => course.status === "ACTIVE").length
    : (activeOnlyCourses?.length ?? 0);

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <CardEyebrow>Course management</CardEyebrow>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
          Courses
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {canManageCourses
            ? "Create, edit, and activate or deactivate training programs stored in the CRM database."
            : "View active training programs stored in the CRM database."}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Active courses"
          value={activeCourseCount}
          icon={BookOpen}
          description="Loaded from PostgreSQL"
        />
      </div>

      {canManageCourses && <CreateCourseForm />}

      {canManageCourses ? (
        managedCourses && managedCourses.length > 0 ? (
          <section
            aria-label="All courses"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {managedCourses.map((course) => (
              <CourseManagementCard key={course.id} course={course} />
            ))}
          </section>
        ) : (
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-primary-900">
              No courses yet
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Add a course above to make it available for batches.
            </p>
          </section>
        )
      ) : activeOnlyCourses && activeOnlyCourses.length > 0 ? (
        <section
          aria-label="Active courses"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {activeOnlyCourses.map((course) => (
            <Card key={course.id} className="flex flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Training program
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-primary-900">
                    {course.title}
                  </h2>
                </div>

                <Badge tone="green">Active</Badge>
              </div>

              <dl className="mt-5 text-sm">
                <div>
                  <dt className="text-xs text-slate-400">Duration</dt>

                  <dd className="mt-1 font-medium text-slate-700">
                    {course.duration}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-primary-900">
            No active courses
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add or activate a course in the database to display it here.
          </p>
        </section>
      )}
    </div>
  );
}