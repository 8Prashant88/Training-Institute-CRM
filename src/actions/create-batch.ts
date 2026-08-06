"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { CourseStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createBatch,
  type BatchListItem,
} from "@/services/batch-service";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateString(value: string): boolean {
  if (!datePattern.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

const createBatchSchema = z
  .object({
    courseId: z.uuid({
      error: "Select a valid course.",
    }),

    title: z
      .string()
      .trim()
      .min(3, {
        error:
          "The batch title must contain at least 3 characters.",
      })
      .max(100, {
        error:
          "The batch title cannot exceed 100 characters.",
      }),

    capacity: z.coerce
      .number({
        error: "Enter a valid capacity.",
      })
      .int({
        error:
          "Capacity must be a whole number.",
      })
      .min(1, {
        error:
          "Capacity must be at least 1.",
      })
      .max(500, {
        error:
          "Capacity cannot exceed 500.",
      }),

    startDate: z
      .string()
      .refine(isValidDateString, {
        error: "Select a valid start date.",
      }),

    endDate: z
      .string()
      .refine(isValidDateString, {
        error: "Select a valid end date.",
      }),
  })
  .refine(
    (data) =>
      parseDate(data.endDate) >
      parseDate(data.startDate),
    {
      path: ["endDate"],
      error:
        "The end date must be after the start date.",
    },
  );

export type CreateBatchActionInput = z.infer<
  typeof createBatchSchema
>;

type CreateBatchFieldErrors = Partial<
  Record<keyof CreateBatchActionInput, string>
>;

export type CreateBatchActionResult =
  | {
      success: true;
      message: string;
      data: BatchListItem;
      fieldErrors: Record<string, never>;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors: CreateBatchFieldErrors;
    };

export async function submitBatch(
  input: unknown,
): Promise<CreateBatchActionResult> {
  const result =
    createBatchSchema.safeParse(input);

  if (!result.success) {
    const errors = z.flattenError(
      result.error,
    );

    return {
      success: false,
      message:
        "The submitted batch contains validation errors.",
      fieldErrors: {
        courseId:
          errors.fieldErrors.courseId?.[0],
        title:
          errors.fieldErrors.title?.[0],
        capacity:
          errors.fieldErrors.capacity?.[0],
        startDate:
          errors.fieldErrors.startDate?.[0],
        endDate:
          errors.fieldErrors.endDate?.[0],
      },
    };
  }

  try {
    const course =
      await prisma.course.findFirst({
        where: {
          id: result.data.courseId,
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
          courseId:
            "Select an active course.",
        },
      };
    }

    const batch = await createBatch({
      courseId: result.data.courseId,
      title: result.data.title,
      capacity: result.data.capacity,
      startDate: parseDate(
        result.data.startDate,
      ),
      endDate: parseDate(
        result.data.endDate,
      ),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/batches");

    return {
      success: true,
      message:
        "Batch created successfully.",
      data: batch,
      fieldErrors: {},
    };
  } catch (error) {
    console.error(
      "submitBatch failed",
      error,
    );

    return {
      success: false,
      message:
        "The server could not create the batch. Please try again.",
      fieldErrors: {},
    };
  }
}