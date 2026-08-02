"use server";

import * as z from "zod";
import {
  leadFormSchema,
  type LeadFormData,
} from "@/schemas/lead-schema";

type LeadFieldErrors = Partial<
  Record<keyof LeadFormData, string>
>;

export type SubmitLeadResult =
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
  return new Promise((resolve) =>
    setTimeout(resolve, milliseconds),
  );
}

export async function submitLead(
  input: unknown,
): Promise<SubmitLeadResult> {
  try {
    // Temporary delay so we can test the pending state.
    await wait(800);

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

    return {
      success: true,
      message: "Lead submitted successfully.",
      data: result.data,
      fieldErrors: {},
    };
  } catch (error) {
    console.error("submitLead failed", error);

    return {
      success: false,
      message:
        "The server could not process this inquiry. Please try again.",
      fieldErrors: {},
    };
  }
}