"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  LeadStatus as DatabaseLeadStatus,
  UserRole,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import {
  getCurrentAuthenticatedUser,
} from "@/services/user-service";

const manuallyEditableStatuses = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "LOST",
] as const;

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
    manuallyEditableStatuses,
    {
      error:
        "Select a valid lead status.",
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

  try {
    const updatedCount =
      await prisma.$transaction(
        async (transaction) => {
          const updateResult =
            await transaction.lead.updateMany({
              where: {
                id: {
                  in: leadIds,
                },

                archivedAt: null,

                // Enrolled leads must use
                // the enrollment workflow.
                status: {
                  not:
                    DatabaseLeadStatus.ENROLLED,
                },

                ...(currentUser.role ===
                UserRole.ADMIN
                  ? {}
                  : {
                      assignedCounselorId:
                        currentUser.id,
                    }),
              },

              data: {
                status:
                  result.data
                    .status as DatabaseLeadStatus,
              },
            });

          /*
           * If even one selected lead
           * was unauthorized, archived,
           * enrolled, or missing,
           * abort the whole transaction.
           *
           * No partial update.
           */
          if (
            updateResult.count !==
            leadIds.length
          ) {
            throw new BulkLeadAuthorizationError();
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

        status:
          result.data
            .status as DatabaseLeadStatus,
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
          "One or more selected leads are unavailable or you do not have permission to update them.",

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