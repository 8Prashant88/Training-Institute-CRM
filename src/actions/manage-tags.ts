"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { AuthorizationError } from "@/lib/authorization";
import { createTag, TagServiceError, type TagOption } from "@/services/tag-service";
import { getCurrentAuthenticatedUser } from "@/services/user-service";

const createTagSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Enter a tag name." })
    .max(40, { error: "Tag names cannot exceed 40 characters." }),
});

export type CreateTagResult =
  | { success: true; message: string; data: TagOption }
  | { success: false; message: string; data?: undefined };

export async function createTagAction(
  input: unknown,
): Promise<CreateTagResult> {
  const result = createTagSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: z.flattenError(result.error).fieldErrors.name?.[0] ??
        "Enter a valid tag name.",
    };
  }

  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be signed in to create a tag.",
    };
  }

  try {
    const tag = await createTag(result.data.name, currentUser);

    revalidatePath("/dashboard/leads");

    return {
      success: true,
      message: `Tag "${tag.name}" created.`,
      data: tag,
    };
  } catch (error) {
    if (error instanceof TagServiceError) {
      return { success: false, message: error.message };
    }

    if (error instanceof AuthorizationError) {
      return { success: false, message: error.message };
    }

    console.error("createTagAction failed", error);

    return {
      success: false,
      message: "The server could not create this tag. Please try again.",
    };
  }
}
