"use server";

import * as z from "zod";

import {
  leadFormSchema,
  type LeadFormData,
} from "@/schemas/lead-schema";

type LeadFieldErrors = Partial<
  Record<keyof LeadFormData, string>
>;

export type UpdateLeadResult =
  | {
      success: true;
      message: string;
      data: LeadFormData;
      fieldErrors: Record<string, never>;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors: LeadFieldErrors;
    };

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function updateLead(
  leadId: string,
  input: unknown,
): Promise<UpdateLeadResult> {
  await wait(800);

  if (!leadId.trim()) {
    return {
      success: false,
      message: "The lead ID is missing.",
      fieldErrors: {},
    };
  }

  const result = leadFormSchema.safeParse(input);

  if (!result.success) {
    const flattenedErrors = z.flattenError(result.error);

    return {
      success: false,
      message:
        "The submitted information contains validation errors.",
      fieldErrors: {
        fullName:
          flattenedErrors.fieldErrors.fullName?.[0],
        email:
          flattenedErrors.fieldErrors.email?.[0],
        phone:
          flattenedErrors.fieldErrors.phone?.[0],
        interestedCourse:
          flattenedErrors.fieldErrors
            .interestedCourse?.[0],
      },
    };
  }

  if (
    result.data.email.toLowerCase() ===
    "fail@example.com"
  ) {
    return {
      success: false,
      message:
        "The server could not update this lead. Please try again.",
      fieldErrors: {},
    };
  }

  return {
    success: true,
    message: "Lead updated successfully.",
    data: result.data,
    fieldErrors: {},
  };
}