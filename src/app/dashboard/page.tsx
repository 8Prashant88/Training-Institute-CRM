import type { Metadata } from "next";
import { GraduationCap, PhoneCall, UserPlus, Users } from "lucide-react";

import CoursePerformance from "@/components/dashboard/CoursePerformance";
import PipelineBreakdown from "@/components/dashboard/PipelineBreakdown";
import RecentLeadsList from "@/components/dashboard/RecentLeadsList";
import { CardEyebrow } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { courses } from "@/data/courses";
import { leads } from "@/data/leads";
import type { Lead } from "@/types/lead";

export const metadata: Metadata = {
  title: "Dashboard",
};

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

function countCreatedWithin(leadList: Lead[], windowMs: number) {
  const cutoff = Date.now() - windowMs;

  return leadList.filter(
    (lead) => new Date(lead.createdAt).getTime() >= cutoff,
  ).length;
}

export default function DashboardPage() {
  const newThisWeek = countCreatedWithin(leads, WEEK_IN_MS);

  const followUpsDue = leads.filter(
    (lead) => lead.status === "FOLLOW_UP",
  ).length;

  const enrolledCount = leads.filter(
    (lead) => lead.status === "ENROLLED",
  ).length;

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <CardEyebrow>Overview</CardEyebrow>

        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Monitor leads, follow-ups, and course conversion in one place.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="dashboard-statistics">
        <h2 id="dashboard-statistics" className="sr-only">
          Dashboard statistics
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total leads"
            value={leads.length}
            icon={Users}
            description="All inquiries on file"
          />
          <StatCard
            label="New this week"
            value={newThisWeek}
            icon={UserPlus}
            description="Added in the last 7 days"
          />
          <StatCard
            label="Follow-ups due"
            value={followUpsDue}
            icon={PhoneCall}
            description="Counselor action required"
          />
          <StatCard
            label="Active enrollments"
            value={enrolledCount}
            icon={GraduationCap}
            description="Students enrolled"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <PipelineBreakdown leads={leads} />
        <CoursePerformance courses={courses} leads={leads} />
      </section>

      <RecentLeadsList leads={leads} />
    </div>
  );
}
