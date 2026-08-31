import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  PhoneCall,
  Target,
  UserPlus,
  Users,
} from "lucide-react";

import CoursePerformance from "@/components/dashboard/CoursePerformance";
import LeadsBySource from "@/components/dashboard/LeadsBySource";
import PipelineBreakdown from "@/components/dashboard/PipelineBreakdown";
import RecentLeadsList from "@/components/dashboard/RecentLeadsList";

import StatCard from "@/components/ui/StatCard";

import { cn } from "@/lib/cn";

import {
  getDashboardData,
} from "@/services/dashboard-service";

import {
  getCurrentAuthenticatedUser,
} from "@/services/user-service";

function greetingForHour(hour: number): string {
  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const currentUser =
    await getCurrentAuthenticatedUser();

  if (!currentUser) {
    redirect("/login");
  }

  const dashboard =
    await getDashboardData(
      currentUser,
    );

  const {
    stats,
    statusBreakdown,
    sourceBreakdown,
    coursePerformance,
    recentLeads,
  } = dashboard;

  const firstName = currentUser.fullName.split(" ")[0];

  const greeting = greetingForHour(new Date().getHours());

  const isAdmin = currentUser.role === "ADMIN";

  const attentionItems = [
    {
      key: "follow-ups",
      count: stats.followUpsDue,
      label:
        stats.followUpsDue === 1
          ? "follow-up is overdue"
          : "follow-ups are overdue",
      href: "/dashboard/leads/follow-ups",
    },

    ...(isAdmin
      ? [
          {
            key: "unassigned",
            count: stats.unassignedLeads,
            label:
              stats.unassignedLeads === 1
                ? "lead has no counselor assigned"
                : "leads have no counselor assigned",
            href: "/dashboard/leads?counselor=unassigned",
          },
        ]
      : []),
  ];

  const attentionTotal = attentionItems.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-5 shadow-[var(--shadow-panel)] sm:p-8">
        <div
          aria-hidden="true"
          className="app-sidebar-pattern pointer-events-none absolute inset-0 opacity-60"
        />

        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-400">
              {greeting}
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {firstName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-200 sm:text-base">
              Here&apos;s where leads, follow-ups, and enrollments stand
              right now.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="needs-attention">
        <h2 id="needs-attention" className="sr-only">
          Needs attention
        </h2>

        <div
          className={cn(
            "flex flex-col gap-3 rounded-xl border p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between sm:p-5",
            attentionTotal > 0
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50",
          )}
        >
          <div className="flex items-start gap-3">
            {attentionTotal > 0 ? (
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-red-600"
              />
            ) : (
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-green-600"
              />
            )}

            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  attentionTotal > 0 ? "text-red-900" : "text-green-900",
                )}
              >
                {attentionTotal > 0
                  ? "Needs attention"
                  : "All caught up"}
              </p>

              <p
                className={cn(
                  "mt-0.5 text-sm",
                  attentionTotal > 0 ? "text-red-700" : "text-green-700",
                )}
              >
                {attentionTotal > 0
                  ? attentionItems
                      .filter((item) => item.count > 0)
                      .map((item) => `${item.count} ${item.label}`)
                      .join(" · ")
                  : "No overdue follow-ups and every lead has an owner."}
              </p>
            </div>
          </div>

          {attentionTotal > 0 && (
            <div className="flex shrink-0 flex-wrap gap-2 sm:ml-4">
              {attentionItems
                .filter((item) => item.count > 0)
                .map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    Review
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                ))}
            </div>
          )}
        </div>
      </section>

      <section
        aria-labelledby="dashboard-statistics"
      >
        <h2
          id="dashboard-statistics"
          className="sr-only"
        >
          Dashboard statistics
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total leads"
            value={
              stats.totalLeads
            }
            icon={Users}
            description="All active inquiries"
          />

          <StatCard
            label="New this week"
            value={
              stats.newThisWeek
            }
            icon={UserPlus}
            description="Added in the last 7 days"
          />

          <StatCard
            label="Follow-ups due"
            value={
              stats.followUpsDue
            }
            icon={PhoneCall}
            description="Due now or overdue"
          />

          <StatCard
            label="Active enrollments"
            value={
              stats.activeEnrollments
            }
            icon={
              GraduationCap
            }
            description="Currently active, right now"
          />

          <StatCard
            label="Enrolled this month"
            value={
              stats.enrollmentsThisMonth
            }
            icon={CalendarCheck}
            description="Conversions since the 1st"
          />

          <StatCard
            label="Conversion rate"
            value={`${stats.conversionRate}%`}
            icon={Target}
            description="Enrolled leads, all time"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <PipelineBreakdown
          statusBreakdown={statusBreakdown}
        />

        <LeadsBySource
          breakdown={sourceBreakdown}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <CoursePerformance
          rows={coursePerformance}
        />

        <RecentLeadsList
          leads={recentLeads}
        />
      </section>
    </div>
  );
}
