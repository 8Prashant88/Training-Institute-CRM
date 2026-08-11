import "server-only";

import {
  LeadSource as DatabaseLeadSource,
  LeadStatus as DatabaseLeadStatus,
  Prisma,
  UserRole,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import type {
  AuthenticatedCrmUser,
} from "@/services/user-service";

import {
  leadStatuses,
  type Lead,
  type LeadSource,
  type LeadStatus,
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

/*
 * Each column shows only the most recent N leads for that status,
 * with a real total count in the header. This keeps the board fast
 * for statuses with hundreds of leads — the full list is always one
 * click away via the existing /dashboard/leads?status=X filter.
 */
const COLUMN_LEAD_LIMIT = 25;

export type LeadPipelineCardData = Lead & {
  nextFollowUpAt: string | null;
};

export type LeadPipelineColumn = {
  status: LeadStatus;
  totalCount: number;
  leads: LeadPipelineCardData[];
};

export type LeadPipelineFilters = {
  /** Admin-only. "UNASSIGNED" filters to leads with no counselor. */
  counselorId?: string;
};

export async function listLeadPipeline(
  currentUser: Pick<AuthenticatedCrmUser, "id" | "role">,
  filters: LeadPipelineFilters = {},
): Promise<LeadPipelineColumn[]> {
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const baseWhere: Prisma.LeadWhereInput = {
    archivedAt: null,

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

  return Promise.all(
    leadStatuses.map(async (status) => {
      const where: Prisma.LeadWhereInput = {
        ...baseWhere,
        status: status as DatabaseLeadStatus,
      };

      const [totalCount, databaseLeads] = await Promise.all([
        prisma.lead.count({ where }),

        prisma.lead.findMany({
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
            createdAt: "desc",
          },

          take: COLUMN_LEAD_LIMIT,
        }),
      ]);

      const leads: LeadPipelineCardData[] = databaseLeads.map((lead) => ({
        id: lead.id,
        fullName: lead.fullName,
        email: lead.email ?? "",
        phone: lead.phone,
        interestedCourse: lead.interestedCourse.title,
        status: statusLabels[lead.status],
        source: sourceLabels[lead.source],
        assignedTo: lead.assignedCounselor?.fullName ?? "Unassigned",
        createdAt: lead.createdAt.toISOString(),
        nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
      }));

      return { status, totalCount, leads };
    }),
  );
}
