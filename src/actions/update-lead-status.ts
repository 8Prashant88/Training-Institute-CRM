"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  LeadStatus as DatabaseLeadStatus,
} from "@/generated/prisma/client";
import {
  updateLeadStatus,
  type UpdatedLeadStatus,
} from "@/services/lead-service";

const manuallyEditableLeadStatusValues = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "LOST",
] as const;

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
      },
    };
  }

  try {
    const updatedLead =
      await updateLeadStatus(
        result.data.leadId,
        result.data
          .status as DatabaseLeadStatus,
      );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
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