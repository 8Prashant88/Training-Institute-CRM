import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  GraduationCap,
  UserX,
} from "lucide-react";

import StudentRowActions from "@/components/students/StudentRowActions";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { CardEyebrow } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import StatCard from "@/components/ui/StatCard";

import {
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/Table";

import { isAdmin } from "@/lib/authorization";
import { formatDate } from "@/lib/format";
import { listBatches } from "@/services/batch-service";
import { listCoursesForLeadFilters } from "@/services/course-service";
import { listStudents } from "@/services/student-service";
import { getCurrentAuthenticatedUser } from "@/services/user-service";
import type { EnrollmentStatus } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Students",
};

const STUDENT_STATUS_VALUES = [
  "ACTIVE",
  "COMPLETED",
  "DROPPED",
  "CANCELLED",
] as const;

const statusDetails: Record<
  EnrollmentStatus,
  { label: string; tone: BadgeTone }
> = {
  ACTIVE: { label: "Active", tone: "green" },
  COMPLETED: { label: "Completed", tone: "blue" },
  CANCELLED: { label: "Cancelled", tone: "slate" },
  DROPPED: { label: "Dropped", tone: "red" },
};

function isEnrollmentStatus(
  value: string | undefined,
): value is EnrollmentStatus {
  return (
    value !== undefined &&
    (STUDENT_STATUS_VALUES as readonly string[]).includes(value)
  );
}

type StudentsPageProps = {
  searchParams: Promise<{
    q?: string;
    batch?: string;
    course?: string;
    status?: string;
  }>;
};

export default async function StudentsPage({
  searchParams,
}: StudentsPageProps) {
  const { q, batch, course, status } = await searchParams;

  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    redirect("/login");
  }

  const statusFilter = isEnrollmentStatus(status) ? status : undefined;

  const [students, batches, courses] = await Promise.all([
    listStudents(currentUser, {
      search: q,
      batchId: batch,
      courseId: course,
      status: statusFilter,
    }),

    listBatches(),
    listCoursesForLeadFilters(),
  ]);

  const activeCount = students.filter(
    (student) => student.status === "ACTIVE",
  ).length;

  const completedCount = students.filter(
    (student) => student.status === "COMPLETED",
  ).length;

  const droppedCount = students.filter(
    (student) => student.status === "DROPPED",
  ).length;

  const hasActiveFilters = Boolean(q || batch || course || status);

  return (
    <div className="grid min-w-0 gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <CardEyebrow>Student roster</CardEyebrow>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
          Students
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {isAdmin(currentUser)
            ? "Everyone currently or previously enrolled, across every counselor."
            : "Everyone currently or previously enrolled from your assigned leads."}
        </p>
      </section>

      <section
        aria-label="Student statistics"
        className="grid gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Active students"
          value={activeCount}
          icon={GraduationCap}
          description="Currently in a batch"
        />

        <StatCard
          label="Completed"
          value={completedCount}
          icon={CheckCircle2}
          description="Finished their course"
        />

        <StatCard
          label="Dropped"
          value={droppedCount}
          icon={UserX}
          description="Left mid-course"
        />
      </section>

      <form
        method="GET"
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4 sm:items-end sm:p-5"
      >
        <div className="sm:col-span-2">
          <label
            htmlFor="student-search"
            className="mb-1.5 block text-xs font-medium text-slate-500"
          >
            Search
          </label>

          <Input
            id="student-search"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Name, email, or phone"
          />
        </div>

        <div>
          <label
            htmlFor="student-batch"
            className="mb-1.5 block text-xs font-medium text-slate-500"
          >
            Batch
          </label>

          <Select id="student-batch" name="batch" defaultValue={batch ?? ""}>
            <option value="">All batches</option>

            {batches.map((batchOption) => (
              <option key={batchOption.id} value={batchOption.id}>
                {batchOption.courseTitle} — {batchOption.title}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label
            htmlFor="student-course"
            className="mb-1.5 block text-xs font-medium text-slate-500"
          >
            Course
          </label>

          <Select
            id="student-course"
            name="course"
            defaultValue={course ?? ""}
          >
            <option value="">All courses</option>

            {courses.map((courseOption) => (
              <option key={courseOption.id} value={courseOption.id}>
                {courseOption.title}
                {courseOption.status === "INACTIVE" ? " (inactive)" : ""}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label
            htmlFor="student-status"
            className="mb-1.5 block text-xs font-medium text-slate-500"
          >
            Status
          </label>

          <Select
            id="student-status"
            name="status"
            defaultValue={statusFilter ?? ""}
          >
            <option value="">All statuses</option>

            {STUDENT_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {statusDetails[value].label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex gap-2 sm:col-span-4 sm:justify-end">
          {hasActiveFilters && (
            <Link href="/dashboard/students">
              <Button type="button" variant="outline">
                Clear filters
              </Button>
            </Link>
          )}

          <Button type="submit">Apply filters</Button>
        </div>
      </form>

      {students.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-primary-900">
            No students found
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {hasActiveFilters
              ? "No enrollments match the current filters."
              : "Enroll a lead from the Leads page to see them here."}
          </p>
        </section>
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Student</TH>
                <TH>Course / batch</TH>
                <TH>Counselor</TH>
                <TH>Status</TH>
                <TH>Enrolled</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>

            <TBody>
              {students.map((student) => {
                const details = statusDetails[student.status];

                return (
                  <TR key={student.enrollmentId}>
                    <TD>
                      <Link
                        href={`/dashboard/leads/${student.leadId}`}
                        className="font-medium text-primary-900 hover:underline"
                      >
                        {student.fullName}
                      </Link>

                      <div className="text-xs text-slate-400">
                        {student.email || student.phone}
                      </div>
                    </TD>

                    <TD>
                      <div className="font-medium text-slate-700">
                        {student.courseTitle}
                      </div>

                      <div className="text-xs text-slate-400">
                        {student.batchTitle}
                      </div>
                    </TD>

                    <TD className="text-slate-600">
                      {student.assignedCounselor}
                    </TD>

                    <TD>
                      <Badge tone={details.tone}>{details.label}</Badge>
                    </TD>

                    <TD className="whitespace-nowrap text-slate-600">
                      {formatDate(student.enrolledAt)}
                    </TD>

                    <TD className="text-right">
                      {student.status === "ACTIVE" && (
                        <StudentRowActions
                          enrollmentId={student.enrollmentId}
                          studentName={student.fullName}
                          batchTitle={student.batchTitle}
                        />
                      )}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
