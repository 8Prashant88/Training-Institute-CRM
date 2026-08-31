"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  LeadFieldUpdateError,
  setLeadFavorite,
} from "@/services/lead-service";
import { getCurrentAuthenticatedUser } from "@/services/user-service";

const setLeadFavoriteSchema = z.object({
  leadId: z.uuid({ error: "The lead ID is invalid." }),
  isFavorited: z.boolean(),
});

export type SetLeadFavoriteResult =
  | { success: true; message: string; data: { isFavorited: boolean } }
  | { success: false; message: string; data?: undefined };

export async function setLeadFavoriteAction(
  input: unknown,
): Promise<SetLeadFavoriteResult> {
  const result = setLeadFavoriteSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "The submitted request is invalid.",
    };
  }

  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be signed in to favorite a lead.",
    };
  }

  try {
    const updated = await setLeadFavorite(
      result.data.leadId,
      result.data.isFavorited,
      currentUser,
    );

    revalidatePath("/dashboard/leads");
    revalidatePath(`/dashboard/leads/${result.data.leadId}`);

    return {
      success: true,
      message: updated.isFavorited
        ? "Added to favourites."
        : "Removed from favourites.",
      data: { isFavorited: updated.isFavorited },
    };
  } catch (error) {
    if (error instanceof LeadFieldUpdateError) {
      return { success: false, message: error.message };
    }

    console.error("setLeadFavoriteAction failed", error);

    return {
      success: false,
      message: "The server could not update this lead. Please try again.",
    };
  }
}
