"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  LeadFieldUpdateError,
  setLeadTags,
} from "@/services/lead-service";
import { getCurrentAuthenticatedUser } from "@/services/user-service";

const updateLeadTagsSchema = z.object({
  leadId: z.uuid({ error: "The lead ID is invalid." }),

  tagIds: z
    .array(z.uuid())
    .max(20, { error: "A lead can carry at most 20 tags." })
    .transform((ids) => [...new Set(ids)]),
});

export type UpdateLeadTagsResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function updateLeadTagsAction(
  input: unknown,
): Promise<UpdateLeadTagsResult> {
  const result = updateLeadTagsSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "The submitted tags are invalid.",
    };
  }

  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be signed in to update a lead.",
    };
  }

  try {
    await setLeadTags(result.data.leadId, result.data.tagIds, currentUser);

    revalidatePath("/dashboard/leads");
    revalidatePath(`/dashboard/leads/${result.data.leadId}`);

    return { success: true, message: "Tags updated." };
  } catch (error) {
    if (error instanceof LeadFieldUpdateError) {
      return { success: false, message: error.message };
    }

    console.error("updateLeadTagsAction failed", error);

    return {
      success: false,
      message: "The server could not update the tags. Please try again.",
    };
  }
}
