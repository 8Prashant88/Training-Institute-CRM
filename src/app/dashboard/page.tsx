import type {
  Metadata,
} from "next";

import {
  redirect,
} from "next/navigation";

import {
  CalendarCheck,
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

import {
  CardEyebrow,
} from "@/components/ui/Card";

import StatCard from "@/components/ui/StatCard";

import {
  getDashboardData,
} from "@/services/dashboard-service";

import {
  getCurrentAuthenticatedUser,
} from "@/services/user-service";

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

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <CardEyebrow>
          Overview
        </CardEyebrow>

        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Monitor real leads,
              follow-ups,
              enrollments, and
              course conversion in
              one place.
            </p>
          </div>
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
            description="Non-archived inquiries"
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
