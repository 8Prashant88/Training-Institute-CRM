"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  getLeadById,
  ScheduleLeadFollowUpError,
  scheduleLeadFollowUp,
  type ScheduledLeadFollowUp,
} from "@/services/lead-service";
import {
  canAccessLead,
} from "@/lib/authorization";

import {
  getCurrentAuthenticatedUser,
} from "@/services/user-service";

const scheduleLeadFollowUpSchema = z.object({
  leadId: z.uuid({
    error: "The lead ID is invalid.",
  }),

  /** null clears the scheduled follow-up date. */
  nextFollowUpAt: z.coerce
    .date({
      error: "Enter a valid follow-up date.",
    })
    .nullable(),

  note: z
    .string()
    .trim()
    .max(2000, {
      error: "Notes cannot exceed 2000 characters.",
    })
    .optional(),
});

export type ScheduleLeadFollowUpInput = z.infer<
  typeof scheduleLeadFollowUpSchema
>;

type ScheduleLeadFollowUpFieldErrors = Partial<
  Record<keyof ScheduleLeadFollowUpInput, string>
>;

export type ScheduleLeadFollowUpResult =
  | {
      success: true;
      message: string;
      data: ScheduledLeadFollowUp;
      fieldErrors: Record<string, never>;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors: ScheduleLeadFollowUpFieldErrors;
    };

export async function submitScheduleLeadFollowUp(
  input: unknown,
): Promise<ScheduleLeadFollowUpResult> {
  const result = scheduleLeadFollowUpSchema.safeParse(input);

  if (!result.success) {
    const errors = z.flattenError(result.error);

    return {
      success: false,
      message: "The follow-up update is invalid.",

      fieldErrors: {
        leadId: errors.fieldErrors.leadId?.[0],
        nextFollowUpAt: errors.fieldErrors.nextFollowUpAt?.[0],
        note: errors.fieldErrors.note?.[0],
      },
    };
  }

  try {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        success: false,
        message: "You must be signed in to update a lead.",
        fieldErrors: {},
      };
    }

    const lead = await getLeadById(result.data.leadId);

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
        message: "You are not authorized to update this lead.",
        fieldErrors: {},
      };
    }

    const updated = await scheduleLeadFollowUp({
      leadId: result.data.leadId,

      actor: {
        id: currentUser.id,
        role: currentUser.role,
      },

      nextFollowUpAt: result.data.nextFollowUpAt,
      note: result.data.note,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/leads/follow-ups");
    revalidatePath(`/dashboard/leads/${updated.id}`);

    return {
      success: true,

      message: result.data.nextFollowUpAt
        ? "Follow-up scheduled successfully."
        : "Follow-up cleared successfully.",

      data: updated,
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof ScheduleLeadFollowUpError) {
      switch (error.code) {
        case "LEAD_NOT_FOUND":
        case "FORBIDDEN":
        case "LEAD_NOT_ELIGIBLE":
          return {
            success: false,
            message: error.message,
            fieldErrors: {},
          };

        case "FOLLOW_UP_DATE_IN_PAST":
          return {
            success: false,
            message: error.message,
            fieldErrors: { nextFollowUpAt: error.message },
          };
      }
    }

    console.error("submitScheduleLeadFollowUp failed", error);

    return {
      success: false,
      message:
        "The server could not update the follow-up date. Please try again.",
      fieldErrors: {},
    };
  }
}
