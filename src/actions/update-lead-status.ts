"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  LeadStatus as DatabaseLeadStatus,
} from "@/generated/prisma/client";
import {
  manuallyEditableLeadStatusValues,
} from "@/lib/lead-status-rules";
import {
  getLeadById,
  LeadStatusChangeError,
  updateLeadStatus,
  type UpdatedLeadStatus,
} from "@/services/lead-service";
import {
  canAccessLead,
} from "@/lib/authorization";


import {
  getCurrentAuthenticatedUser,
} from "@/services/user-service";

const updateLeadStatusSchema = z.object({
  leadId: z.uuid({
    error: "The lead ID is invalid.",
  }),

  status: z.enum(
  manuallyEditableLeadStatusValues,
  {
    error:
      "Select a valid manually editable lead status.",
  },
),

  note: z
    .string()
    .trim()
    .max(2000, {
      error: "Notes cannot exceed 2000 characters.",
    })
    .optional(),

  nextFollowUpAt: z.coerce
    .date({
      error: "Enter a valid follow-up date.",
    })
    .optional(),
});

export type UpdateLeadStatusInput = z.infer<
  typeof updateLeadStatusSchema
>;

type UpdateLeadStatusFieldErrors = Partial<
  Record<keyof UpdateLeadStatusInput, string>
>;

export type UpdateLeadStatusResult =
  | {
      success: true;
      message: string;
      data: UpdatedLeadStatus;
      fieldErrors: Record<string, never>;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors: UpdateLeadStatusFieldErrors;
    };

function isRecordNotFoundError(
  error: unknown,
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code ===
      "P2025"
  );
}

export async function changeLeadStatus(
  input: unknown,
): Promise<UpdateLeadStatusResult> {
  const result =
    updateLeadStatusSchema.safeParse(input);

  if (!result.success) {
    const errors = z.flattenError(
      result.error,
    );

    return {
      success: false,
      message:
        "The submitted status update is invalid.",

      fieldErrors: {
        leadId:
          errors.fieldErrors.leadId?.[0],

        status:
          errors.fieldErrors.status?.[0],

        note:
          errors.fieldErrors.note?.[0],

        nextFollowUpAt:
          errors.fieldErrors.nextFollowUpAt?.[0],
      },
    };
  }

  try {
  const currentUser =
    await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return {
      success: false,
      message:
        "You must be signed in to update a lead.",
      fieldErrors: {},
    };
  }

  const lead = await getLeadById(
    result.data.leadId,
  );

  if (!lead) {
    return {
      success: false,
      message:
        "The lead was not found or has already been archived.",
      fieldErrors: {},
    };
  }

  const hasAccess = canAccessLead(
    currentUser,
    lead.assignedCounselor?.id ?? null,
  );

  if (!hasAccess) {
    return {
      success: false,
      message:
        "You are not authorized to update this lead.",
      fieldErrors: {},
    };
  }

  const updatedLead =
    await updateLeadStatus({
      leadId: result.data.leadId,
      toStatus: result.data.status as DatabaseLeadStatus,

      actor: {
        id: currentUser.id,
        role: currentUser.role,
      },

      note: result.data.note,
      nextFollowUpAt: result.data.nextFollowUpAt,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/leads/follow-ups");
    revalidatePath(
      `/dashboard/leads/${updatedLead.id}`,
    );

    return {
      success: true,
      message:
        "Lead status updated successfully.",
      data: updatedLead,
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof LeadStatusChangeError) {
      switch (error.code) {
        case "LEAD_NOT_FOUND":
        case "FORBIDDEN":
          return {
            success: false,
            message: error.message,
            fieldErrors: {},
          };

        case "INVALID_TRANSITION":
          return {
            success: false,
            message: error.message,
            fieldErrors: { status: error.message },
          };

        case "NOTE_REQUIRED":
          return {
            success: false,
            message: error.message,
            fieldErrors: { note: error.message },
          };

        case "FOLLOW_UP_DATE_REQUIRED":
        case "FOLLOW_UP_DATE_IN_PAST":
          return {
            success: false,
            message: error.message,
            fieldErrors: { nextFollowUpAt: error.message },
          };
      }
    }

    if (isRecordNotFoundError(error)) {
      return {
        success: false,
        message:
          "The lead was not found or has already been archived.",
        fieldErrors: {},
      };
    }

    console.error(
      "changeLeadStatus failed",
      error,
    );

    return {
      success: false,
      message:
        "The server could not update the lead status. Please try again.",
      fieldErrors: {},
    };
  }
}
