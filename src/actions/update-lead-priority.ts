"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { leadPriorities } from "@/types/lead";
import {
  LeadFieldUpdateError,
  setLeadPriority,
} from "@/services/lead-service";
import { getCurrentAuthenticatedUser } from "@/services/user-service";

const updateLeadPrioritySchema = z.object({
  leadId: z.uuid({ error: "The lead ID is invalid." }),

  priority: z
    .enum(leadPriorities, { error: "Select a valid priority." })
    .nullable(),
});

export type UpdateLeadPriorityResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function updateLeadPriorityAction(
  input: unknown,
): Promise<UpdateLeadPriorityResult> {
  const result = updateLeadPrioritySchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "The submitted priority is invalid.",
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
    await setLeadPriority(
      result.data.leadId,
      result.data.priority,
      currentUser,
    );

    revalidatePath("/dashboard/leads");
    revalidatePath(`/dashboard/leads/${result.data.leadId}`);

    return { success: true, message: "Priority updated." };
  } catch (error) {
    if (error instanceof LeadFieldUpdateError) {
      return { success: false, message: error.message };
    }

    console.error("updateLeadPriorityAction failed", error);

    return {
      success: false,
      message: "The server could not update the priority. Please try again.",
    };
  }
}
