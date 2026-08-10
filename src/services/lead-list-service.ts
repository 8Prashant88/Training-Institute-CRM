import "server-only";

import {
  LeadSource as DatabaseLeadSource,
  LeadStatus as DatabaseLeadStatus,
  Prisma,
  UserRole,
} from "@/generated/prisma/client";

import {
  LEAD_PAGE_SIZE,
  type LeadListQuery,
} from "@/lib/lead-list-query";

import { prisma } from "@/lib/prisma";

import type {
  AuthenticatedCrmUser,
} from "@/services/user-service";

import type {
  Lead,
  LeadSource,
  LeadStatus,
} from "@/types/lead";

export type LeadListItem = Lead & {
  nextFollowUpAt: string | null;
};

export type LeadStatusCounts = Record<
  "ALL" | LeadStatus,
  number
>;

export type LeadListPagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type LeadListResult = {
  items: LeadListItem[];
  statusCounts: LeadStatusCounts;
  pagination: LeadListPagination;
};

const sourceLabels: Record<
  DatabaseLeadSource,
  LeadSource
> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  WALK_IN: "Walk-in",
  SOCIAL_MEDIA: "Social Media",
  PHONE_INQUIRY: "Phone Inquiry",
  EVENT: "Event",
};

const statusLabels: Record<
  DatabaseLeadStatus,
  LeadStatus
> = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  INTERESTED: "INTERESTED",
  FOLLOW_UP: "FOLLOW_UP",
  ENROLLED: "ENROLLED",
  LOST: "LOST",
};

const leadListSelect = {
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
} satisfies Prisma.LeadSelect;

/*
 * Builds every filter EXCEPT status.
 *
 * We intentionally keep status separate
 * because the status pills should show
 * counts for all statuses while the other
 * active filters remain applied.
 */
function buildBaseWhere(
  currentUser: Pick<
    AuthenticatedCrmUser,
    "id" | "role"
  >,
  query: LeadListQuery,
): Prisma.LeadWhereInput {
  const isAdmin =
    currentUser.role === UserRole.ADMIN;

  const searchConditions:
    Prisma.LeadWhereInput[] = [];

  if (query.search) {
    searchConditions.push(
      {
        fullName: {
          contains: query.search,
          mode: "insensitive",
        },
      },

      {
        email: {
          contains: query.search,
          mode: "insensitive",
        },
      },

      {
        phone: {
          contains: query.search,
        },
      },

      {
        interestedCourse: {
          is: {
            title: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      },
    );

    /*
     * Only admins search counselor names
     * because counselors never receive
     * organization-wide counselor data.
     */
    if (isAdmin) {
      searchConditions.push({
        assignedCounselor: {
          is: {
            fullName: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      });
    }
  }

  /*
   * Authorization is built directly into
   * the database query.
   *
   * COUNSELOR:
   * assignedCounselorId = current user
   *
   * ADMIN:
   * unrestricted organization-wide access
   */
  const authorizationFilter:
    Prisma.LeadWhereInput = isAdmin
      ? {}
      : {
          assignedCounselorId:
            currentUser.id,
        };

  /*
   * Counselor filter is ADMIN-only.
   *
   * Even if a counselor manually adds:
   *
   * ?counselor=<another-user-id>
   *
   * it cannot override their ownership
   * restriction.
   */
  let counselorFilter:
    Prisma.LeadWhereInput = {};

  if (
    isAdmin &&
    query.counselor
  ) {
    counselorFilter =
      query.counselor ===
      "UNASSIGNED"
        ? {
            assignedCounselorId:
              null,
          }
        : {
            assignedCounselorId:
              query.counselor,
          };
  }

  return {
    archivedAt: null,

    ...authorizationFilter,

    ...counselorFilter,

    ...(query.source
      ? {
          source:
            query.source as DatabaseLeadSource,
        }
      : {}),

    ...(query.courseId
      ? {
          interestedCourseId:
            query.courseId,
        }
      : {}),

    ...(searchConditions.length > 0
      ? {
          OR: searchConditions,
        }
      : {}),
  };
}

function buildWhere(
  currentUser: Pick<
    AuthenticatedCrmUser,
    "id" | "role"
  >,
  query: LeadListQuery,
): Prisma.LeadWhereInput {
  const baseWhere =
    buildBaseWhere(
      currentUser,
      query,
    );

  if (!query.status) {
    return baseWhere;
  }

  return {
    ...baseWhere,

    status:
      query.status as DatabaseLeadStatus,
  };
}

function buildOrderBy(
  query: LeadListQuery,
): Prisma.LeadOrderByWithRelationInput[] {
  /*
   * nextFollowUpAt is nullable.
   *
   * Leads without follow-up dates are
   * always kept at the bottom.
   */
  if (
    query.sortBy ===
    "nextFollowUpAt"
  ) {
    return [
      {
        nextFollowUpAt: {
          sort:
            query.sortDirection,

          nulls: "last",
        },
      },

      /*
       * Stable secondary sorting.
       */
      {
        createdAt: "desc",
      },

      {
        id: "asc",
      },
    ];
  }

  return [
    {
      createdAt:
        query.sortDirection,
    },

    /*
     * Two leads may have the same
     * createdAt timestamp.
     *
     * UUID gives deterministic ordering
     * so pagination does not randomly
     * shuffle equal rows.
     */
    {
      id:
        query.sortDirection,
    },
  ];
}

function createEmptyStatusCounts():
  LeadStatusCounts {
  return {
    ALL: 0,
    NEW: 0,
    CONTACTED: 0,
    INTERESTED: 0,
    FOLLOW_UP: 0,
    ENROLLED: 0,
    LOST: 0,
  };
}

export async function listLeadPage(
  currentUser: Pick<
    AuthenticatedCrmUser,
    "id" | "role"
  >,
  query: LeadListQuery,
): Promise<LeadListResult> {
  /*
   * Does not include status.
   *
   * Used for status facet counts.
   */
  const baseWhere =
    buildBaseWhere(
      currentUser,
      query,
    );

  /*
   * Complete filter including status.
   */
  const where =
    buildWhere(
      currentUser,
      query,
    );

  const orderBy =
    buildOrderBy(query);

  /*
   * RepeatableRead gives count,
   * status counts and rows a consistent
   * snapshot during this request.
   */
  return prisma.$transaction(
    async (transaction) => {
      /*
       * Count AFTER all active filters.
       */
      const totalCount =
        await transaction.lead.count({
          where,
        });

      /*
       * Keep at least page 1 even when
       * there are zero matching results.
       */
      const totalPages =
        Math.max(
          1,
          Math.ceil(
            totalCount /
              LEAD_PAGE_SIZE,
          ),
        );

      /*
       * Protect against:
       *
       * ?page=999
       *
       * after filters reduce the number
       * of available pages.
       */
      const page =
        Math.min(
          query.page,
          totalPages,
        );

      /*
       * Database-side status facets.
       *
       * Example:
       *
       * ALL 35
       * NEW 8
       * CONTACTED 10
       * FOLLOW_UP 7
       *
       * while search/course/source/etc.
       * remain applied.
       */
      const statusGroups =
        await transaction.lead.groupBy({
          by: ["status"],

          where: baseWhere,

          _count: {
            _all: true,
          },
        });

      /*
       * PostgreSQL returns ONLY the
       * records required for this page.
       */
      const databaseLeads =
        await transaction.lead.findMany({
          where,

          select:
            leadListSelect,

          orderBy,

          skip:
            (page - 1) *
            LEAD_PAGE_SIZE,

          take:
            LEAD_PAGE_SIZE,
        });

      const statusCounts =
        createEmptyStatusCounts();

      for (
        const group of
        statusGroups
      ) {
        const status =
          statusLabels[
            group.status
          ];

        const count =
          group._count._all;

        statusCounts[
          status
        ] = count;

        statusCounts.ALL +=
          count;
      }

      const items:
        LeadListItem[] =
        databaseLeads.map(
          (lead) => ({
            id: lead.id,

            fullName:
              lead.fullName,

            email:
              lead.email ?? "",

            phone:
              lead.phone,

            interestedCourse:
              lead
                .interestedCourse
                .title,

            status:
              statusLabels[
                lead.status
              ],

            source:
              sourceLabels[
                lead.source
              ],

            assignedTo:
              lead
                .assignedCounselor
                ?.fullName ??
              "Unassigned",

            createdAt:
              lead.createdAt.toISOString(),

            nextFollowUpAt:
              lead.nextFollowUpAt
                ?.toISOString() ??
              null,
          }),
        );

      return {
        items,

        statusCounts,

        pagination: {
          page,

          pageSize:
            LEAD_PAGE_SIZE,

          totalCount,

          totalPages,

          hasPreviousPage:
            page > 1,

          hasNextPage:
            page <
            totalPages,
        },
      };
    },

    {
      isolationLevel:
        Prisma
          .TransactionIsolationLevel
          .RepeatableRead,
    },
  );
}