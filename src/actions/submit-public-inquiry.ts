"use server";

import * as z from "zod";

import {
  publicInquirySchema,
  type PublicInquiryFormData,
} from "@/schemas/lead-schema";

type PublicInquiryFieldErrors = Partial<
  Record<keyof PublicInquiryFormData, string>
>;

export type SubmitPublicInquiryResult =
  | {
      success: true;
      message: string;
      data: PublicInquiryFormData;
      fieldErrors: Record<string, never>;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors: PublicInquiryFieldErrors;
    };

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function submitPublicInquiry(
  input: unknown,
): Promise<SubmitPublicInquiryResult> {
  await wait(800);

  const result = publicInquirySchema.safeParse(input);

  if (!result.success) {
    const flattenedErrors = z.flattenError(result.error);

    return {
      success: false,
      message:
        "The inquiry contains invalid information.",
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

        message:
          flattenedErrors.fieldErrors.message?.[0],
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
        "The server could not submit your inquiry. Please try again.",
      fieldErrors: {},
    };
  }

  return {
    success: true,
    message:
      "Your inquiry has been submitted successfully.",
    data: result.data,
    fieldErrors: {},
  };
}