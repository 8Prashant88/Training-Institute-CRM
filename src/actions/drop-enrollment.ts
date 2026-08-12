"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  EnrollmentServiceError,
  dropEnrollment,
  type EnrollmentDetails,
} from "@/services/enrollment-service";

import { getCurrentAuthenticatedUser } from "@/services/user-service";

const dropEnrollmentSchema = z.object({
  enrollmentId: z.uuid({
    error: "The enrollment ID is invalid.",
  }),

  reason: z
    .string()
    .trim()
    .max(500, {
      error: "The reason cannot exceed 500 characters.",
    })
    .optional(),
});

export type DropEnrollmentActionResult =
  | {
      success: true;
      message: string;
      data: EnrollmentDetails;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
    };

export async function submitDropEnrollment(
  input: unknown,
): Promise<DropEnrollmentActionResult> {
  const result = dropEnrollmentSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "The submitted request is invalid.",
    };
  }

  try {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        success: false,
        message: "You must be signed in to update an enrollment.",
      };
    }

    const enrollment = await dropEnrollment({
      enrollmentId: result.data.enrollmentId,
      reason: result.data.reason,

      actor: {
        id: currentUser.id,
        role: currentUser.role,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/students");
    revalidatePath("/dashboard/batches");
    revalidatePath(`/dashboard/leads/${enrollment.leadId}`);

    return {
      success: true,
      message: "The student was marked as dropped.",
      data: enrollment,
    };
  } catch (error) {
    if (error instanceof EnrollmentServiceError) {
      return {
        success: false,
        message: error.message,
      };
    }

    console.error("submitDropEnrollment failed", error);

    return {
      success: false,
      message: "The server could not update this enrollment. Please try again.",
    };
  }
}
