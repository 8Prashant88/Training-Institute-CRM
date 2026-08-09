import "server-only";

import {
  EnrollmentStatus,
  LeadStatus as DatabaseLeadStatus,
  UserRole,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import {
  listActiveCourses,
} from "@/services/course-service";

import {
  listLeads,
} from "@/services/lead-service";

import type {
  AuthenticatedCrmUser,
} from "@/services/user-service";

import type {
  Lead,
} from "@/types/lead";

const WEEK_IN_MS =
  7 * 24 * 60 * 60 * 1000;

export type DashboardCourse = {
  id: string;
  title: string;
};

export type DashboardData = {
  stats: {
    totalLeads: number;
    newThisWeek: number;
    followUpsDue: number;
    activeEnrollments: number;
  };

  leads: Lead[];

  courses: DashboardCourse[];
};

export async function getDashboardData(
  currentUser: Pick<
    AuthenticatedCrmUser,
    "id" | "role"
  >,
): Promise<DashboardData> {
  const now = new Date();

  const oneWeekAgo = new Date(
    now.getTime() - WEEK_IN_MS,
  );

  const isAdminUser =
    currentUser.role ===
    UserRole.ADMIN;

  const leadAccessFilter =
    isAdminUser
      ? {}
      : {
          assignedCounselorId:
            currentUser.id,
        };

  const [
    leads,
    activeCourses,
    followUpsDue,
    activeEnrollments,
  ] = await Promise.all([
    listLeads(currentUser),

    listActiveCourses(),

    prisma.lead.count({
      where: {
        archivedAt: null,

        status:
          DatabaseLeadStatus.FOLLOW_UP,

        nextFollowUpAt: {
          lte: now,
        },

        ...leadAccessFilter,
      },
    }),

    prisma.enrollment.count({
      where: {
        status:
          EnrollmentStatus.ACTIVE,

        ...(isAdminUser
          ? {}
          : {
              lead: {
                assignedCounselorId:
                  currentUser.id,

                archivedAt: null,
              },
            }),
      },
    }),
  ]);

  const newThisWeek =
    leads.filter(
      (lead) =>
        new Date(
          lead.createdAt,
        ).getTime() >=
        oneWeekAgo.getTime(),
    ).length;

  return {
    stats: {
      totalLeads:
        leads.length,

      newThisWeek,

      followUpsDue,

      activeEnrollments,
    },

    leads,

    courses:
      activeCourses.map(
        (course) => ({
          id: course.id,
          title: course.title,
        }),
      ),
  };
}