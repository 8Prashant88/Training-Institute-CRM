"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { BatchStatus } from "@/generated/prisma/client";
import {
  BatchServiceError,
  updateBatchStatus,
  type BatchListItem,
} from "@/services/batch-service";
import { AuthorizationError, requireAdmin } from "@/lib/authorization";

import { getCurrentAuthenticatedUser } from "@/services/user-service";

const updateBatchStatusSchema = z.object({
  batchId: z.uuid({
    error: "The batch ID is invalid.",
  }),

  status: z.enum(BatchStatus, {
    error: "Select a valid batch status.",
  }),
});

export type UpdateBatchStatusActionResult =
  | {
      success: true;
      message: string;
      data: BatchListItem;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
    };

export async function submitBatchStatusUpdate(
  input: unknown,
): Promise<UpdateBatchStatusActionResult> {
  const result = updateBatchStatusSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "The submitted status change is invalid.",
    };
  }

  try {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        success: false,
        message: "You must be signed in to change a batch's status.",
      };
    }

    requireAdmin(currentUser);

    const batch = await updateBatchStatus({
      batchId: result.data.batchId,
      status: result.data.status,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/batches");
    revalidatePath("/dashboard/leads");

    return {
      success: true,
      message: `Batch marked as ${batch.status.toLowerCase()}.`,
      data: batch,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        message: "Only administrators can change a batch's status.",
      };
    }

    if (error instanceof BatchServiceError) {
      return {
        success: false,
        message: error.message,
      };
    }

    console.error("submitBatchStatusUpdate failed", error);

    return {
      success: false,
      message: "The server could not update the batch. Please try again.",
    };
  }
}
