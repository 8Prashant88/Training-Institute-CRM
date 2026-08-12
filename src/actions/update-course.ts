"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { courseSchema } from "@/schemas/course-schema";
import {
  updateCourse,
  type CourseRecord,
} from "@/services/course-service";
import { AuthorizationError, requireAdmin } from "@/lib/authorization";

import { getCurrentAuthenticatedUser } from "@/services/user-service";

const updateCourseSchema = courseSchema.extend({
  courseId: z.uuid({
    error: "The course ID is invalid.",
  }),
});

export type UpdateCourseActionInput = z.infer<typeof updateCourseSchema>;

type UpdateCourseFieldErrors = Partial<
  Record<keyof UpdateCourseActionInput, string>
>;

export type UpdateCourseActionResult =
  | {
      success: true;
      message: string;
      data: CourseRecord;
      fieldErrors: Record<string, never>;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors: UpdateCourseFieldErrors;
    };

function isDuplicateTitleError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

function isRecordNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2025"
  );
}

export async function submitCourseUpdate(
  input: unknown,
): Promise<UpdateCourseActionResult> {
  const result = updateCourseSchema.safeParse(input);

  if (!result.success) {
    const errors = z.flattenError(result.error);

    return {
      success: false,
      message: "The submitted course contains validation errors.",
      fieldErrors: {
        courseId: errors.fieldErrors.courseId?.[0],
        title: errors.fieldErrors.title?.[0],
        duration: errors.fieldErrors.duration?.[0],
      },
    };
  }

  try {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        success: false,
        message: "You must be signed in to update a course.",
        fieldErrors: {},
      };
    }

    requireAdmin(currentUser);

    const course = await updateCourse(result.data.courseId, {
      title: result.data.title,
      duration: result.data.duration,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard/batches");

    return {
      success: true,
      message: "Course updated successfully.",
      data: course,
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        message: "Only administrators can update courses.",
        fieldErrors: {},
      };
    }

    if (isDuplicateTitleError(error)) {
      return {
        success: false,
        message: "A course with this title already exists.",
        fieldErrors: {
          title: "Choose a different course title.",
        },
      };
    }

    if (isRecordNotFoundError(error)) {
      return {
        success: false,
        message: "The course was not found.",
        fieldErrors: {},
      };
    }

    console.error("submitCourseUpdate failed", error);

    return {
      success: false,
      message: "The server could not update the course. Please try again.",
      fieldErrors: {},
    };
  }
}
