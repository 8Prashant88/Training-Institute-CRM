"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  CourseServiceError,
  toggleCourseStatus,
  type CourseRecord,
} from "@/services/course-service";
import { AuthorizationError, requireAdmin } from "@/lib/authorization";

import { getCurrentAuthenticatedUser } from "@/services/user-service";

const toggleCourseStatusSchema = z.object({
  courseId: z.uuid({
    error: "The course ID is invalid.",
  }),
});

export type ToggleCourseStatusResult =
  | {
      success: true;
      message: string;
      data: CourseRecord;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
    };

export async function submitCourseStatusToggle(
  input: unknown,
): Promise<ToggleCourseStatusResult> {
  const result = toggleCourseStatusSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "The course ID is invalid.",
    };
  }

  try {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        success: false,
        message: "You must be signed in to change a course's status.",
      };
    }

    requireAdmin(currentUser);

    const course = await toggleCourseStatus(result.data.courseId);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard/batches");

    return {
      success: true,
      message:
        course.status === "ACTIVE"
          ? "Course activated."
          : "Course deactivated.",
      data: course,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        message: "Only administrators can change a course's status.",
      };
    }

    if (error instanceof CourseServiceError) {
      return {
        success: false,
        message: error.message,
      };
    }

    console.error("submitCourseStatusToggle failed", error);

    return {
      success: false,
      message: "The server could not update the course. Please try again.",
    };
  }
}
