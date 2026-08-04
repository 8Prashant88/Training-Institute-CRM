"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  CourseStatus,
  UserRole,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { leadFormSchema } from "@/schemas/lead-schema";
import { createLead } from "@/services/lead-service";
import type { Lead } from "@/types/lead";

const leadSourceValues = [
  "WEBSITE",
  "REFERRAL",
  "WALK_IN",
  "SOCIAL_MEDIA",
  "PHONE_INQUIRY",
  "EVENT",
] as const;

const submitLeadSchema = leadFormSchema
  .pick({
    fullName: true,
    email: true,
    phone: true,
  })
  .extend({
    interestedCourseId: z.uuid({
      error: "Select a valid course.",
    }),

    source: z.enum(leadSourceValues, {
      error: "Select a valid lead source.",
    }),

    assignedCounselorId: z.uuid({
      error: "Select a valid counselor.",
    }),
  });

export type SubmitLeadInput = z.infer<
  typeof submitLeadSchema
>;

type SubmitLeadFieldErrors = Partial<
  Record<keyof SubmitLeadInput, string>
>;

export type SubmitLeadResult =
  | {
      success: true;
      message: string;
      data: Lead;
      fieldErrors: Record<string, never>;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors: SubmitLeadFieldErrors;
    };

export async function submitLead(
  input: unknown,
): Promise<SubmitLeadResult> {
  try {
    const result = submitLeadSchema.safeParse(input);

    if (!result.success) {
      const errors = z.flattenError(result.error);

      return {
        success: false,
        message:
          "The submitted information contains validation errors.",
        fieldErrors: {
          fullName: errors.fieldErrors.fullName?.[0],
          email: errors.fieldErrors.email?.[0],
          phone: errors.fieldErrors.phone?.[0],
          interestedCourseId:
            errors.fieldErrors.interestedCourseId?.[0],
          source: errors.fieldErrors.source?.[0],
          assignedCounselorId:
            errors.fieldErrors.assignedCounselorId?.[0],
        },
      };
    }

    const [course, counselor] = await Promise.all([
      prisma.course.findFirst({
        where: {
          id: result.data.interestedCourseId,
          status: CourseStatus.ACTIVE,
        },
        select: {
          id: true,
        },
      }),

      prisma.user.findFirst({
        where: {
          id: result.data.assignedCounselorId,
          role: UserRole.COUNSELOR,
          isActive: true,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!course || !counselor) {
      return {
        success: false,
        message:
          "The selected course or counselor is no longer available.",
        fieldErrors: {
          interestedCourseId: !course
            ? "Select an active course."
            : undefined,

          assignedCounselorId: !counselor
            ? "Select an active counselor."
            : undefined,
        },
      };
    }

    const lead = await createLead({
      fullName: result.data.fullName,
      email: result.data.email,
      phone: result.data.phone,
      interestedCourseId:
        result.data.interestedCourseId,
      source: result.data.source,
      assignedCounselorId:
        result.data.assignedCounselorId,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");

    return {
      success: true,
      message: "Lead added successfully.",
      data: lead,
      fieldErrors: {},
    };
  } catch (error) {
    console.error("submitLead failed", error);

    return {
      success: false,
      message:
        "The server could not add this lead. Please try again.",
      fieldErrors: {},
    };
  }
}