"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { createSavedViewSchema } from "@/schemas/saved-view-schema";
import {
  createSavedView,
  deleteSavedView,
  SavedViewServiceError,
  type SavedViewSummary,
} from "@/services/saved-view-service";
import { getCurrentAuthenticatedUser } from "@/services/user-service";

export type CreateSavedViewResult =
  | { success: true; message: string; data: SavedViewSummary }
  | { success: false; message: string; data?: undefined };

export async function createSavedViewAction(
  input: unknown,
): Promise<CreateSavedViewResult> {
  const result = createSavedViewSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "The submitted view could not be saved.",
    };
  }

  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be signed in to save a view.",
    };
  }

  try {
    const view = await createSavedView({
      ownerId: currentUser.id,
      name: result.data.name,
      query: result.data.query,
    });

    revalidatePath("/dashboard/leads");

    return {
      success: true,
      message: `Saved view "${view.name}" created.`,
      data: view,
    };
  } catch (error) {
    if (error instanceof SavedViewServiceError) {
      return { success: false, message: error.message };
    }

    console.error("createSavedViewAction failed", error);

    return {
      success: false,
      message: "The server could not save this view. Please try again.",
    };
  }
}

const deleteSavedViewSchema = z.object({
  id: z.uuid({ error: "The saved view ID is invalid." }),
});

export type DeleteSavedViewResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function deleteSavedViewAction(
  input: unknown,
): Promise<DeleteSavedViewResult> {
  const result = deleteSavedViewSchema.safeParse(input);

  if (!result.success) {
    return { success: false, message: "The saved view could not be found." };
  }

  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be signed in to delete a view.",
    };
  }

  try {
    await deleteSavedView(result.data.id, currentUser.id);

    revalidatePath("/dashboard/leads");

    return { success: true, message: "Saved view removed." };
  } catch (error) {
    if (error instanceof SavedViewServiceError) {
      return { success: false, message: error.message };
    }

    console.error("deleteSavedViewAction failed", error);

    return {
      success: false,
      message: "The server could not remove this view. Please try again.",
    };
  }
}
