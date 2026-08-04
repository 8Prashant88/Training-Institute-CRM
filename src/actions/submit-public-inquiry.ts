"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  CourseStatus,
  LeadSource,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  publicInquirySchema,
  type PublicInquiryFormData,
} from "@/schemas/lead-schema";
import { createLead } from "@/services/lead-service";

type PublicInquiryFieldErrors = Partial<
  Record<keyof PublicInquiryFormData, string>
>;

export type SubmitPublicInquiryResult =
  | {
      success: true;
      message: string;
      data: {
        leadId: string;
      };
      fieldErrors: Record<string, never>;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors: PublicInquiryFieldErrors;
    };

export async function submitPublicInquiry(
  input: unknown,
): Promise<SubmitPublicInquiryResult> {
  try {
    const result = publicInquirySchema.safeParse(input);

    if (!result.success) {
      const errors = z.flattenError(result.error);

      return {
        success: false,
        message:
          "The inquiry contains invalid information.",
        fieldErrors: {
          fullName:
            errors.fieldErrors.fullName?.[0],

          email:
            errors.fieldErrors.email?.[0],

          phone:
            errors.fieldErrors.phone?.[0],

          interestedCourseId:
            errors.fieldErrors
              .interestedCourseId?.[0],

          message:
            errors.fieldErrors.message?.[0],
        },
      };
    }

    const course = await prisma.course.findFirst({
      where: {
        id: result.data.interestedCourseId,
        status: CourseStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return {
        success: false,
        message:
          "The selected course is no longer available.",
        fieldErrors: {
          interestedCourseId:
            "Select an active course.",
        },
      };
    }

    const lead = await createLead({
      fullName: result.data.fullName,
      email: result.data.email,
      phone: result.data.phone,
      interestedCourseId:
        result.data.interestedCourseId,
      source: LeadSource.WEBSITE,
      assignedCounselorId: null,
      inquiryMessage: result.data.message,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/courses");

    return {
      success: true,
      message:
        "Your inquiry has been submitted successfully.",
      data: {
        leadId: lead.id,
      },
      fieldErrors: {},
    };
  } catch (error) {
    console.error(
      "submitPublicInquiry failed",
      error,
    );

    return {
      success: false,
      message:
        "The server could not submit your inquiry. Please try again.",
      fieldErrors: {},
    };
  }
}