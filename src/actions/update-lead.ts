"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { CourseStatus, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { leadFormSchema } from "@/schemas/lead-schema";
import { canAccessLead, isAdmin } from "@/lib/authorization";

import { getCurrentAuthenticatedUser } from "@/services/user-service";
import { notifyCounselorAssigned } from "@/services/notification-service";

const updateLeadSchema = leadFormSchema
  .omit({
    interestedCourse: true,
  })
  .extend({
    interestedCourseId: z.uuid({
      error: "Select a valid course.",
    }),

    assignedCounselorId: z.union([
      z.literal(""),
      z.uuid({
        error: "Select a valid counselor.",
      }),
    ]),
  });

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

type UpdateLeadFieldErrors = Partial<Record<keyof UpdateLeadInput, string>>;

export type UpdateLeadResult =
  | {
      success: true;
      message: string;
      data: {
        fullName: string;
        email: string;
        phone: string;
        interestedCourseId: string;
        assignedCounselorId: string;
      };
      fieldErrors: Record<string, never>;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors: UpdateLeadFieldErrors;
    };

export async function updateLead(
  leadId: string,
  input: unknown,
): Promise<UpdateLeadResult> {
  try {
    const leadIdResult = z.uuid().safeParse(leadId);

    if (!leadIdResult.success) {
      return {
        success: false,
        message: "The lead could not be found.",
        fieldErrors: {},
      };
    }

    const result = updateLeadSchema.safeParse(input);

    if (!result.success) {
      const errors = z.flattenError(result.error);

      return {
        success: false,
        message: "The submitted information contains validation errors.",

        fieldErrors: {
          fullName: errors.fieldErrors.fullName?.[0],

          email: errors.fieldErrors.email?.[0],

          phone: errors.fieldErrors.phone?.[0],

          interestedCourseId: errors.fieldErrors.interestedCourseId?.[0],

          assignedCounselorId: errors.fieldErrors.assignedCounselorId?.[0],
        },
      };
    }
    const currentUser = await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        success: false,
        message: "You must be signed in to update a lead.",
        fieldErrors: {},
      };
    }

    const existingLead = await prisma.lead.findFirst({
      where: {
        id: leadIdResult.data,
        archivedAt: null,
      },

      select: {
        id: true,
        assignedCounselorId: true,
      },
    });

    if (!existingLead) {
      return {
        success: false,
        message: "The lead was not found or has been archived.",
        fieldErrors: {},
      };
    }

    const hasAccess = canAccessLead(
      currentUser,
      existingLead.assignedCounselorId,
    );

    if (!hasAccess) {
      return {
        success: false,
        message: "You are not authorized to update this lead.",
        fieldErrors: {},
      };
    }

    const { fullName, email, phone, interestedCourseId, assignedCounselorId } =
      result.data;
    const existingAssignedCounselorId =
      existingLead.assignedCounselorId ?? "";

    if (
      !isAdmin(currentUser) &&
      assignedCounselorId !== existingAssignedCounselorId
    ) {
      return {
        success: false,
        message:
          "Only administrators can change lead assignments.",

        fieldErrors: {
          assignedCounselorId:
            "You cannot change the assigned counselor.",
        },
      };
    }

    const [course, counselor] = await Promise.all([
      prisma.course.findFirst({
        where: {
          id: interestedCourseId,
          status: CourseStatus.ACTIVE,
        },

        select: {
          id: true,
        },
      }),

      isAdmin(currentUser) &&
assignedCounselorId
  ? prisma.user.findFirst({
            where: {
              id: assignedCounselorId,
              role: UserRole.COUNSELOR,
              isActive: true,
            },

            select: {
              id: true,
            },
          })
        : Promise.resolve(null),
    ]);

    if (!course) {
      return {
        success: false,
        message: "The selected course is no longer available.",

        fieldErrors: {
          interestedCourseId: "Select an active course.",
        },
      };
    }

    if (
  isAdmin(currentUser) &&
  assignedCounselorId &&
  !counselor
){
      return {
        success: false,
        message: "The selected counselor is no longer available.",

        fieldErrors: {
          assignedCounselorId: "Select an active counselor.",
        },
      };
    }

    const updatedLead = await prisma.lead.update({
      where: {
        id: leadIdResult.data,
        archivedAt: null,
      },

      data: {
        fullName: fullName.trim(),

        email: email.trim().toLowerCase(),

        phone: phone.trim(),

        interestedCourseId,

        assignedCounselorId:
  isAdmin(currentUser)
    ? assignedCounselorId || null
    : existingLead.assignedCounselorId,
      },

      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        interestedCourseId: true,
        assignedCounselorId: true,
      },
    });

    /*
     * A genuine reassignment: an admin changed who this lead is
     * assigned to, versus resubmitting the form with the same
     * counselor already on it (compared against the value read before
     * this update, not against the incoming form's default).
     */
    if (
      isAdmin(currentUser) &&
      updatedLead.assignedCounselorId &&
      updatedLead.assignedCounselorId !==
        existingLead.assignedCounselorId
    ) {
      try {
        await notifyCounselorAssigned(
          prisma,
          updatedLead,
          updatedLead.assignedCounselorId,
        );
      } catch (error) {
        console.error("Lead reassignment notification failed.", {
          leadId: updatedLead.id,
          error,
        });
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath(`/dashboard/leads/${updatedLead.id}`);
    revalidatePath("/dashboard/courses");

    return {
      success: true,
      message: "Lead updated successfully.",

      data: {
        fullName: updatedLead.fullName,
        email: updatedLead.email ?? "",
        phone: updatedLead.phone,

        interestedCourseId: updatedLead.interestedCourseId,

        assignedCounselorId: updatedLead.assignedCounselorId ?? "",
      },

      fieldErrors: {},
    };
  } catch (error) {
    console.error("updateLead failed", error);

    return {
      success: false,
      message: "The server could not update this lead. Please try again.",
      fieldErrors: {},
    };
  }
}
