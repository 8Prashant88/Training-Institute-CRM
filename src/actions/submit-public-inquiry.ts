"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import * as z from "zod";

import { CourseStatus, LeadSource } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  publicInquirySchema,
  type PublicInquiryFormData,
} from "@/schemas/lead-schema";
import { createLead } from "@/services/lead-service";
import { sendPublicInquiryNotification } from "@/services/email-service";

/*
 * This is the one endpoint in the CRM anyone on the internet can call
 * without signing in, so it's the one endpoint that needs abuse
 * protection independent of auth. 5 submissions per 10 minutes per IP
 * is generous for a real visitor filling out one inquiry, and slows a
 * spam script down without needing a CAPTCHA yet.
 */
const PUBLIC_INQUIRY_RATE_LIMIT = {
  limit: 5,
  windowMs: 10 * 60 * 1000,
};

async function getClientIp(): Promise<string> {
  const headerList = await headers();

  /*
   * x-forwarded-for can be a comma-separated chain of proxies; the
   * first entry is the original client. Trusted here because the app
   * only ever runs behind its own reverse proxy / hosting platform,
   * which sets this header itself.
   */
  const forwardedFor = headerList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return headerList.get("x-real-ip") ?? "unknown";
}

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
    const clientIp = await getClientIp();

    const rateLimitResult = checkRateLimit(
      `public-inquiry:${clientIp}`,
      PUBLIC_INQUIRY_RATE_LIMIT,
    );

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        message:
          "Too many inquiries submitted. Please try again in a few minutes.",
        fieldErrors: {},
      };
    }

    const result = publicInquirySchema.safeParse(input);

    if (!result.success) {
      const errors = z.flattenError(result.error);

      return {
        success: false,
        message: "The inquiry contains invalid information.",
        fieldErrors: {
          fullName: errors.fieldErrors.fullName?.[0],

          email: errors.fieldErrors.email?.[0],

          phone: errors.fieldErrors.phone?.[0],

          interestedCourseId: errors.fieldErrors.interestedCourseId?.[0],

          message: errors.fieldErrors.message?.[0],
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
        message: "The selected course is no longer available.",
        fieldErrors: {
          interestedCourseId: "Select an active course.",
        },
      };
    }

    const lead = await createLead({
      fullName: result.data.fullName,
      email: result.data.email,
      phone: result.data.phone,
      interestedCourseId: result.data.interestedCourseId,
      source: LeadSource.WEBSITE,
      assignedCounselorId: null,
      inquiryMessage: result.data.message,
    });
    
    const notificationResult = await sendPublicInquiryNotification({
      leadId: lead.id,

      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,

      courseTitle: lead.interestedCourse,

      message: result.data.message,
    });

    if (!notificationResult.success) {
      console.error("Public inquiry email notification failed.", {
        leadId: lead.id,
        code: notificationResult.code,
        message: notificationResult.message,
      });
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/courses");

    return {
      success: true,
      message: "Your inquiry has been submitted successfully.",
      data: {
        leadId: lead.id,
      },
      fieldErrors: {},
    };
  } catch (error) {
    console.error("submitPublicInquiry failed", error);

    return {
      success: false,
      message: "The server could not submit your inquiry. Please try again.",
      fieldErrors: {},
    };
  }
}
