"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { courseSchema } from "@/schemas/course-schema";
import { createCourse, type CourseRecord } from "@/services/course-service";
import { AuthorizationError, requireAdmin } from "@/lib/authorization";

import { getCurrentAuthenticatedUser } from "@/services/user-service";

export type CreateCourseActionInput = z.infer<typeof courseSchema>;

type CreateCourseFieldErrors = Partial<
  Record<keyof CreateCourseActionInput, string>
>;

export type CreateCourseActionResult =
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
      fieldErrors: CreateCourseFieldErrors;
    };

function isDuplicateTitleError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function submitCourse(
  input: unknown,
): Promise<CreateCourseActionResult> {
  const result = courseSchema.safeParse(input);

  if (!result.success) {
    const errors = z.flattenError(result.error);

    return {
      success: false,
      message: "The submitted course contains validation errors.",
      fieldErrors: {
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
        message: "You must be signed in to create a course.",
        fieldErrors: {},
      };
    }

    requireAdmin(currentUser);

    const course = await createCourse(result.data);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard/batches");

    return {
      success: true,
      message: "Course created successfully.",
      data: course,
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        message: "Only administrators can create courses.",
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

    console.error("submitCourse failed", error);

    return {
      success: false,
      message: "The server could not create the course. Please try again.",
      fieldErrors: {},
    };
  }
}
