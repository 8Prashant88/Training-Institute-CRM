"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  EnrollmentServiceError,
  completeEnrollment,
  type EnrollmentDetails,
} from "@/services/enrollment-service";

import { getCurrentAuthenticatedUser } from "@/services/user-service";

const completeEnrollmentSchema = z.object({
  enrollmentId: z.uuid({
    error: "The enrollment ID is invalid.",
  }),
});

export type CompleteEnrollmentActionResult =
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

export async function submitCompleteEnrollment(
  input: unknown,
): Promise<CompleteEnrollmentActionResult> {
  const result = completeEnrollmentSchema.safeParse(input);

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

    const enrollment = await completeEnrollment({
      enrollmentId: result.data.enrollmentId,

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
      message: "The student was marked as completed.",
      data: enrollment,
    };
  } catch (error) {
    if (error instanceof EnrollmentServiceError) {
      return {
        success: false,
        message: error.message,
      };
    }

    console.error("submitCompleteEnrollment failed", error);

    return {
      success: false,
      message: "The server could not update this enrollment. Please try again.",
    };
  }
}
