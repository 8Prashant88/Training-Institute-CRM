"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  LeadActivityType as DatabaseLeadActivityType,
  LeadStatus as DatabaseLeadStatus,
  UserRole,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import {
  bulkEligibleLeadStatusValues,
} from "@/lib/lead-status-rules";

import {
  getCurrentAuthenticatedUser,
} from "@/services/user-service";

const bulkUpdateLeadStatusSchema = z.object({
  leadIds: z
    .array(
      z.uuid({
        error: "A selected lead ID is invalid.",
      }),
    )
    .min(1, {
      error: "Select at least one lead.",
    })
    .max(100, {
      error:
        "You can update a maximum of 100 leads at once.",
    })
    .transform((ids) => [
      ...new Set(ids),
    ]),

  status: z.enum(
    bulkEligibleLeadStatusValues,
    {
      error:
        "Select a valid lead status. Bulk updates cannot move leads to Follow-up or reactivate Lost leads — do those one lead at a time so a follow-up date or note can be recorded.",
    },
  ),
});

export type BulkUpdateLeadStatusInput =
  z.infer<
    typeof bulkUpdateLeadStatusSchema
  >;

type BulkUpdateFieldErrors =
  Partial<
    Record<
      "leadIds" | "status",
      string
    >
  >;

export type BulkUpdateLeadStatusResult =
  | {
      success: true;
      message: string;
      data: {
        updatedCount: number;
        status:
          DatabaseLeadStatus;
      };
      fieldErrors: Record<
        string,
        never
      >;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors:
        BulkUpdateFieldErrors;
    };

class BulkLeadAuthorizationError
  extends Error {
  constructor() {
    super(
      "One or more selected leads cannot be updated.",
    );

    this.name =
      "BulkLeadAuthorizationError";
  }
}

export async function bulkChangeLeadStatus(
  input: unknown,
): Promise<BulkUpdateLeadStatusResult> {
  const result =
    bulkUpdateLeadStatusSchema.safeParse(
      input,
    );

  if (!result.success) {
    const errors =
      z.flattenError(
        result.error,
      );

    return {
      success: false,

      message:
        "The bulk status update contains validation errors.",

      fieldErrors: {
        leadIds:
          errors.fieldErrors
            .leadIds?.[0],

        status:
          errors.fieldErrors
            .status?.[0],
      },
    };
  }

  const currentUser =
    await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return {
      success: false,

      message:
        "You must be signed in to update leads.",

      fieldErrors: {},
    };
  }

  const leadIds =
    result.data.leadIds;

  const toStatus =
    result.data.status as DatabaseLeadStatus;

  try {
    const updatedCount =
      await prisma.$transaction(
        async (transaction) => {
          /*
           * Bulk status-change can't collect a per-lead note or
           * follow-up date, so it may only target statuses whose
           * transition never requires either (see
           * lib/lead-status-rules.ts). LOST and ENROLLED source
           * leads are excluded for the same reason: reactivating
           * a LOST lead always requires a note, and ENROLLED is
           * terminal.
           */
          const eligibleLeads =
            await transaction.lead.findMany({
              where: {
                id: {
                  in: leadIds,
                },

                archivedAt: null,

                status: {
                  notIn: [
                    DatabaseLeadStatus.ENROLLED,
                    DatabaseLeadStatus.LOST,
                  ],
                },

                ...(currentUser.role ===
                UserRole.ADMIN
                  ? {}
                  : {
                      assignedCounselorId:
                        currentUser.id,
                    }),
              },

              select: {
                id: true,
                status: true,
              },
            });

          /*
           * If even one selected lead was unauthorized, archived,
           * enrolled, lost, or missing, abort the whole
           * transaction. No partial update.
           */
          if (
            eligibleLeads.length !==
            leadIds.length
          ) {
            throw new BulkLeadAuthorizationError();
          }

          const updateResult =
            await transaction.lead.updateMany({
              where: {
                id: {
                  in: eligibleLeads.map(
                    (lead) => lead.id,
                  ),
                },
              },

              data: {
                status: toStatus,
              },
            });

          if (
            updateResult.count !==
            leadIds.length
          ) {
            throw new BulkLeadAuthorizationError();
          }

          /*
           * Skip leads that were already at the target status —
           * a "moved from CONTACTED to CONTACTED" activity row
           * would just be noise.
           */
          const changedLeads =
            eligibleLeads.filter(
              (lead) =>
                lead.status !== toStatus,
            );

          if (changedLeads.length > 0) {
            await transaction.leadActivity.createMany({
              data: changedLeads.map(
                (lead) => ({
                  leadId: lead.id,
                  type: DatabaseLeadActivityType.STATUS_CHANGE,
                  fromStatus: lead.status,
                  toStatus,
                  changedById: currentUser.id,
                }),
              ),
            });
          }

          return updateResult.count;
        },
      );

    revalidatePath(
      "/dashboard",
    );

    revalidatePath(
      "/dashboard/leads",
    );

    return {
      success: true,

      message:
        `${updatedCount} lead${
          updatedCount === 1
            ? ""
            : "s"
        } updated successfully.`,

      data: {
        updatedCount,

        status: toStatus,
      },

      fieldErrors: {},
    };
  } catch (error) {
    if (
      error instanceof
      BulkLeadAuthorizationError
    ) {
      return {
        success: false,

        message:
          "One or more selected leads are unavailable, already Lost/Enrolled, or you do not have permission to update them.",

        fieldErrors: {},
      };
    }

    console.error(
      "bulkChangeLeadStatus failed",
      error,
    );

    return {
      success: false,

      message:
        "The server could not update the selected leads. Please try again.",

      fieldErrors: {},
    };
  }
}
