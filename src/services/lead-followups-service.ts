import "server-only";

import {
  LeadSource as DatabaseLeadSource,
  LeadStatus as DatabaseLeadStatus,
  Prisma,
  UserRole,
} from "@/generated/prisma/client";

import { startOfUtcDay } from "@/lib/lead-status-rules";

import { prisma } from "@/lib/prisma";

import type {
  AuthenticatedCrmUser,
} from "@/services/user-service";

import type {
  Lead,
  LeadSource,
  LeadStatus,
} from "@/types/lead";

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

export type LeadFollowUpItem = Lead & {
  nextFollowUpAt: string;
};

export type LeadFollowUpFilters = {
  /** Admin-only. "UNASSIGNED" filters to leads with no counselor. */
  counselorId?: string;
};

export type LeadFollowUpResult = {
  overdue: LeadFollowUpItem[];
  today: LeadFollowUpItem[];
};

export async function listLeadFollowUps(
  currentUser: Pick<AuthenticatedCrmUser, "id" | "role">,
  filters: LeadFollowUpFilters = {},
): Promise<LeadFollowUpResult> {
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const now = new Date();

  /*
   * Same UTC-calendar-day boundary used for follow-up date validation
   * in lib/lead-status-rules.ts, so "scheduled for today" and "due
   * today" agree with each other.
   */
  const startOfTodayUtc = startOfUtcDay(now);

  const startOfTomorrowUtc = new Date(
    startOfTodayUtc.getTime() + 24 * 60 * 60 * 1000,
  );

  const where: Prisma.LeadWhereInput = {
    archivedAt: null,

    nextFollowUpAt: {
      not: null,
      lt: startOfTomorrowUtc,
    },

    ...(isAdmin
      ? filters.counselorId
        ? {
            assignedCounselorId:
              filters.counselorId === "UNASSIGNED"
                ? null
                : filters.counselorId,
          }
        : {}
      : {
          assignedCounselorId: currentUser.id,
        }),
  };

  const leads = await prisma.lead.findMany({
    where,

    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      source: true,
      status: true,
      createdAt: true,
      nextFollowUpAt: true,

      interestedCourse: {
        select: {
          title: true,
        },
      },

      assignedCounselor: {
        select: {
          fullName: true,
        },
      },
    },

    orderBy: {
      nextFollowUpAt: "asc",
    },
  });

  const overdue: LeadFollowUpItem[] = [];
  const today: LeadFollowUpItem[] = [];

  for (const lead of leads) {
    // Guaranteed non-null by the where clause above.
    const nextFollowUpAt = lead.nextFollowUpAt!;

    const item: LeadFollowUpItem = {
      id: lead.id,
      fullName: lead.fullName,
      email: lead.email ?? "",
      phone: lead.phone,
      interestedCourse: lead.interestedCourse.title,
      status: statusLabels[lead.status],
      source: sourceLabels[lead.source],
      assignedTo: lead.assignedCounselor?.fullName ?? "Unassigned",
      createdAt: lead.createdAt.toISOString(),
      nextFollowUpAt: nextFollowUpAt.toISOString(),
    };

    if (nextFollowUpAt < startOfTodayUtc) {
      overdue.push(item);
    } else {
      today.push(item);
    }
  }

  return { overdue, today };
}
