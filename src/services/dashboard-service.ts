import "server-only";

import {
  LeadSource as DatabaseLeadSource,
  LeadStatus as DatabaseLeadStatus,
  Prisma,
  UserRole,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import {
  listCoursesForLeadFilters,
} from "@/services/course-service";

import type {
  AuthenticatedCrmUser,
} from "@/services/user-service";

import type {
  Lead,
  LeadSource,
  LeadStatus,
} from "@/types/lead";

const WEEK_IN_MS =
  7 * 24 * 60 * 60 * 1000;

const sourceLabels: Record<DatabaseLeadSource, LeadSource> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  WALK_IN: "Walk-in",
  SOCIAL_MEDIA: "Social Media",
  PHONE_INQUIRY: "Phone Inquiry",
  EVENT: "Event",
};

const statusLabels: Record<DatabaseLeadStatus, LeadStatus> = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  INTERESTED: "INTERESTED",
  FOLLOW_UP: "FOLLOW_UP",
  ENROLLED: "ENROLLED",
  LOST: "LOST",
};

export type DashboardStats = {
  totalLeads: number;
  newThisWeek: number;
  followUpsDue: number;
  activeEnrollments: number;
  enrollmentsThisMonth: number;
  /** 0-100, rounded. Enrolled leads over all non-archived leads. */
  conversionRate: number;
  /**
   * Admin-only — a counselor never sees unassigned leads (they're not
   * theirs to act on), so this is always 0 for a COUNSELOR viewer
   * rather than a real count.
   */
  unassignedLeads: number;
};

export type LeadStatusBreakdown = Record<LeadStatus, number>;

export type LeadSourceBreakdown = {
  source: LeadSource;
  count: number;
};

export type CoursePerformanceRow = {
  courseId: string;
  courseTitle: string;
  leadCount: number;
  enrolledCount: number;
  /** 0-100, rounded. */
  conversionRate: number;
};

export type DashboardData = {
  stats: DashboardStats;
  statusBreakdown: LeadStatusBreakdown;
  sourceBreakdown: LeadSourceBreakdown[];
  coursePerformance: CoursePerformanceRow[];
  recentLeads: Lead[];
};

function emptyStatusBreakdown(): LeadStatusBreakdown {
  return {
    NEW: 0,
    CONTACTED: 0,
    INTERESTED: 0,
    FOLLOW_UP: 0,
    ENROLLED: 0,
    LOST: 0,
  };
}

/*
 * Everything in this file is server-side aggregation (count, groupBy,
 * or a hard-capped findMany) — nothing loads every lead into memory
 * and filters it in JavaScript. That used to be exactly what this
 * function did (pull every lead, then Array.filter() in three
 * different dashboard components), which is precisely the "database
 * work happening in the browser/app layer instead of PostgreSQL"
 * anti-pattern Day 14 already covers for the leads table itself.
 */
export async function getDashboardData(
  currentUser: Pick<
    AuthenticatedCrmUser,
    "id" | "role"
  >,
): Promise<DashboardData> {
  const now = new Date();

  const oneWeekAgo = new Date(now.getTime() - WEEK_IN_MS);

  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  const isAdminUser = currentUser.role === UserRole.ADMIN;

  const leadWhere: Prisma.LeadWhereInput = {
    archivedAt: null,

    ...(isAdminUser
      ? {}
      : { assignedCounselorId: currentUser.id }),
  };

  const enrollmentLeadFilter: Prisma.EnrollmentWhereInput = isAdminUser
    ? {}
    : {
        lead: {
          assignedCounselorId: currentUser.id,
          archivedAt: null,
        },
      };

  const [
    totalLeads,
    newThisWeek,
    enrolledLeadCount,
    followUpsDue,
    unassignedLeads,
    activeEnrollments,
    enrollmentsThisMonth,
    statusGroups,
    sourceGroups,
    totalByCourseGroups,
    enrolledByCourseGroups,
    allCourses,
    recentLeadRows,
  ] = await Promise.all([
    prisma.lead.count({ where: leadWhere }),

    prisma.lead.count({
      where: { ...leadWhere, createdAt: { gte: oneWeekAgo } },
    }),

    prisma.lead.count({
      where: { ...leadWhere, status: DatabaseLeadStatus.ENROLLED },
    }),

    prisma.lead.count({
      where: {
        ...leadWhere,
        status: DatabaseLeadStatus.FOLLOW_UP,
        nextFollowUpAt: { lte: now },
      },
    }),

    isAdminUser
      ? prisma.lead.count({
          where: { archivedAt: null, assignedCounselorId: null },
        })
      : Promise.resolve(0),

    prisma.enrollment.count({
      where: { status: "ACTIVE", ...enrollmentLeadFilter },
    }),

    /*
     * A historical count of conversions that happened this calendar
     * month — intentionally not filtered by current enrollment status.
     * A lead that enrolled on the 3rd and dropped on the 20th still
     * converted this month; "enrollments this month" is a funnel
     * metric, not a current-headcount one (that's activeEnrollments).
     */
    prisma.enrollment.count({
      where: { enrolledAt: { gte: startOfMonth }, ...enrollmentLeadFilter },
    }),

    prisma.lead.groupBy({
      by: ["status"],
      where: leadWhere,
      _count: { _all: true },
    }),

    prisma.lead.groupBy({
      by: ["source"],
      where: leadWhere,
      _count: { _all: true },
    }),

    prisma.lead.groupBy({
      by: ["interestedCourseId"],
      where: leadWhere,
      _count: { _all: true },
    }),

    prisma.lead.groupBy({
      by: ["interestedCourseId"],
      where: { ...leadWhere, status: DatabaseLeadStatus.ENROLLED },
      _count: { _all: true },
    }),

    /*
     * Every course, active or not — a lead created while its course
     * was still active should still show up in course performance
     * after that course is later deactivated.
     */
    listCoursesForLeadFilters(),

    prisma.lead.findMany({
      where: leadWhere,
      orderBy: { createdAt: "desc" },
      take: 5,

      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        source: true,
        status: true,
        createdAt: true,

        interestedCourse: { select: { title: true } },
        assignedCounselor: { select: { fullName: true } },
      },
    }),
  ]);

  const statusBreakdown = emptyStatusBreakdown();

  for (const group of statusGroups) {
    statusBreakdown[statusLabels[group.status]] = group._count._all;
  }

  const sourceBreakdown: LeadSourceBreakdown[] = sourceGroups
    .map((group) => ({
      source: sourceLabels[group.source],
      count: group._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  const enrolledByCourseMap = new Map<string, number>();

  for (const group of enrolledByCourseGroups) {
    enrolledByCourseMap.set(group.interestedCourseId, group._count._all);
  }

  const courseTitleById = new Map(
    allCourses.map((course) => [course.id, course.title]),
  );

  const coursePerformance: CoursePerformanceRow[] = totalByCourseGroups
    .map((group) => {
      const leadCount = group._count._all;
      const enrolledCount = enrolledByCourseMap.get(group.interestedCourseId) ?? 0;

      return {
        courseId: group.interestedCourseId,
        courseTitle:
          courseTitleById.get(group.interestedCourseId) ?? "Unknown course",
        leadCount,
        enrolledCount,
        conversionRate:
          leadCount > 0 ? Math.round((enrolledCount / leadCount) * 100) : 0,
      };
    })
    .sort((a, b) => b.leadCount - a.leadCount)
    .slice(0, 10);

  const recentLeads: Lead[] = recentLeadRows.map((lead) => ({
    id: lead.id,
    fullName: lead.fullName,
    email: lead.email ?? "",
    phone: lead.phone,
    interestedCourse: lead.interestedCourse.title,
    status: statusLabels[lead.status],
    source: sourceLabels[lead.source],
    assignedTo: lead.assignedCounselor?.fullName ?? "Unassigned",
    createdAt: lead.createdAt.toISOString(),
  }));

  return {
    stats: {
      totalLeads,
      newThisWeek,
      followUpsDue,
      activeEnrollments,
      enrollmentsThisMonth,
      unassignedLeads,

      conversionRate:
        totalLeads > 0
          ? Math.round((enrolledLeadCount / totalLeads) * 100)
          : 0,
    },

    statusBreakdown,
    sourceBreakdown,
    coursePerformance,
    recentLeads,
  };
}
