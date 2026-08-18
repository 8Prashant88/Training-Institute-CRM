"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  CourseStatus,
  UserRole,
} from "@/generated/prisma/client";

import {
  isAdmin,
} from "@/lib/authorization";

import { prisma } from "@/lib/prisma";
import { leadFormSchema } from "@/schemas/lead-schema";
import { createLead } from "@/services/lead-service";
import { notifyCounselorAssigned } from "@/services/notification-service";

import {
  getCurrentAuthenticatedUser,
} from "@/services/user-service";

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

    source: z.enum(
      leadSourceValues,
      {
        error:
          "Select a valid lead source.",
      },
    ),

    assignedCounselorId: z.union([
      z.literal(""),

      z.uuid({
        error:
          "Select a valid counselor.",
      }),
    ]),
  });

export type SubmitLeadInput =
  z.infer<typeof submitLeadSchema>;

type SubmitLeadFieldErrors =
  Partial<
    Record<
      keyof SubmitLeadInput,
      string
    >
  >;

export type SubmitLeadResult =
  | {
      success: true;
      message: string;
      data: Lead;
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
        SubmitLeadFieldErrors;
    };

export async function submitLead(
  input: unknown,
): Promise<SubmitLeadResult> {
  try {
    const currentUser =
      await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        success: false,
        message:
          "You must be signed in to add a lead.",
        fieldErrors: {},
      };
    }

    const result =
      submitLeadSchema.safeParse(
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
          "The submitted information contains validation errors.",

        fieldErrors: {
          fullName:
            errors.fieldErrors
              .fullName?.[0],

          email:
            errors.fieldErrors
              .email?.[0],

          phone:
            errors.fieldErrors
              .phone?.[0],

          interestedCourseId:
            errors.fieldErrors
              .interestedCourseId?.[0],

          source:
            errors.fieldErrors
              .source?.[0],

          assignedCounselorId:
            errors.fieldErrors
              .assignedCounselorId?.[0],
        },
      };
    }

    const adminUser =
      isAdmin(currentUser);

    /*
     * ADMIN:
     * must explicitly choose a counselor.
     *
     * COUNSELOR:
     * browser cannot choose assignment.
     * Server assigns current user.
     */
    if (
      adminUser &&
      !result.data.assignedCounselorId
    ) {
      return {
        success: false,

        message:
          "Select a counselor for this lead.",

        fieldErrors: {
          assignedCounselorId:
            "Select a counselor.",
        },
      };
    }

    const finalCounselorId =
      adminUser
        ? result.data
            .assignedCounselorId
        : currentUser.id;

    const course =
      await prisma.course.findFirst({
        where: {
          id:
            result.data
              .interestedCourseId,

          status:
            CourseStatus.ACTIVE,
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

    /*
     * Admin-selected counselor must
     * still be validated server-side.
     *
     * The authenticated counselor
     * was already validated when the
     * current CRM user was resolved.
     */
    if (adminUser) {
      const counselor =
        await prisma.user.findFirst({
          where: {
            id: finalCounselorId,

            role:
              UserRole.COUNSELOR,

            isActive: true,
          },

          select: {
            id: true,
          },
        });

      if (!counselor) {
        return {
          success: false,

          message:
            "The selected counselor is no longer available.",

          fieldErrors: {
            assignedCounselorId:
              "Select an active counselor.",
          },
        };
      }
    }

    const lead =
      await createLead({
        fullName:
          result.data.fullName,

        email:
          result.data.email,

        phone:
          result.data.phone,

        interestedCourseId:
          result.data
            .interestedCourseId,

        source:
          result.data.source,

        assignedCounselorId:
          finalCounselorId,
      });

    /*
     * Only when an admin explicitly assigns someone else — a counselor
     * self-creating (and self-assigning) their own lead already knows
     * about it, so no notification is needed there.
     */
    if (adminUser && finalCounselorId) {
      try {
        await notifyCounselorAssigned(
          prisma,
          lead,
          finalCounselorId,
        );
      } catch (error) {
        console.error(
          "Lead assignment notification failed.",
          { leadId: lead.id, error },
        );
      }
    }

    revalidatePath(
      "/dashboard",
    );

    revalidatePath(
      "/dashboard/leads",
    );

    return {
      success: true,

      message:
        adminUser
          ? "Lead added successfully."
          : "Lead added and assigned to you successfully.",

      data: lead,

      fieldErrors: {},
    };
  } catch (error) {
    console.error(
      "submitLead failed",
      error,
    );

    return {
      success: false,

      message:
        "The server could not add this lead. Please try again.",

      fieldErrors: {},
    };
  }
}