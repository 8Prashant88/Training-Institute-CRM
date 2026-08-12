"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  BatchServiceError,
  updateBatchDetails,
  type BatchListItem,
} from "@/services/batch-service";
import { AuthorizationError, requireAdmin } from "@/lib/authorization";

import { getCurrentAuthenticatedUser } from "@/services/user-service";

const updateBatchSchema = z.object({
  batchId: z.uuid({
    error: "The batch ID is invalid.",
  }),

  title: z
    .string()
    .trim()
    .min(3, {
      error: "The batch title must contain at least 3 characters.",
    })
    .max(100, {
      error: "The batch title cannot exceed 100 characters.",
    }),

  capacity: z.coerce
    .number({
      error: "Enter a valid capacity.",
    })
    .int({
      error: "Capacity must be a whole number.",
    })
    .min(1, {
      error: "Capacity must be at least 1.",
    })
    .max(500, {
      error: "Capacity cannot exceed 500.",
    }),
});

export type UpdateBatchActionInput = z.infer<typeof updateBatchSchema>;

type UpdateBatchFieldErrors = Partial<
  Record<keyof UpdateBatchActionInput, string>
>;

export type UpdateBatchActionResult =
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
      fieldErrors: UpdateBatchFieldErrors;
    };

export async function submitBatchUpdate(
  input: unknown,
): Promise<UpdateBatchActionResult> {
  const result = updateBatchSchema.safeParse(input);

  if (!result.success) {
    const errors = z.flattenError(result.error);

    return {
      success: false,
      message: "The submitted batch contains validation errors.",
      fieldErrors: {
        batchId: errors.fieldErrors.batchId?.[0],
        title: errors.fieldErrors.title?.[0],
        capacity: errors.fieldErrors.capacity?.[0],
      },
    };
  }

  try {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        success: false,
        message: "You must be signed in to update a batch.",
        fieldErrors: {},
      };
    }

    requireAdmin(currentUser);

    const batch = await updateBatchDetails({
      batchId: result.data.batchId,
      title: result.data.title,
      capacity: result.data.capacity,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/batches");

    return {
      success: true,
      message: "Batch updated successfully.",
      data: batch,
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        message: "Only administrators can update batches.",
        fieldErrors: {},
      };
    }

    if (error instanceof BatchServiceError) {
      return {
        success: false,
        message: error.message,
        fieldErrors:
          error.code === "CAPACITY_BELOW_ENROLLED"
            ? { capacity: error.message }
            : {},
      };
    }

    console.error("submitBatchUpdate failed", error);

    return {
      success: false,
      message: "The server could not update the batch. Please try again.",
      fieldErrors: {},
    };
  }
}
