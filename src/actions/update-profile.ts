"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  ProfileUpdateError,
  getCurrentAuthenticatedUser,
  updateUserAvatarUrl,
  updateUserFullName,
} from "@/services/user-service";
import { deleteUserAvatar, uploadUserAvatar } from "@/lib/supabase/storage";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const updateProfileNameSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { error: "Your name must be at least 2 characters." })
    .max(120, { error: "Your name must be under 120 characters." }),
});

export type UpdateProfileResult =
  | { success: true; message: string; data: { fullName: string } }
  | { success: false; message: string };

export async function updateProfileNameAction(
  input: unknown,
): Promise<UpdateProfileResult> {
  const result = updateProfileNameSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Your name is invalid.",
    };
  }

  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be signed in to update your profile.",
    };
  }

  try {
    const updated = await updateUserFullName(
      currentUser.id,
      result.data.fullName,
    );

    revalidatePath("/dashboard", "layout");

    return {
      success: true,
      message: "Your name was updated.",
      data: { fullName: updated.fullName },
    };
  } catch (error) {
    if (error instanceof ProfileUpdateError) {
      return { success: false, message: error.message };
    }

    console.error("updateProfileNameAction failed", error);

    return {
      success: false,
      message: "The server could not update your profile. Please try again.",
    };
  }
}

export type UpdateAvatarResult =
  | { success: true; message: string; data: { avatarUrl: string | null } }
  | { success: false; message: string };

export async function updateProfileAvatarAction(
  formData: FormData,
): Promise<UpdateAvatarResult> {
  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be signed in to update your profile.",
    };
  }

  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return {
      success: false,
      message: "Choose an image to upload.",
    };
  }

  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return {
      success: false,
      message: "Please upload a PNG, JPEG, or WEBP image.",
    };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return {
      success: false,
      message: "Images must be 3MB or smaller.",
    };
  }

  try {
    const avatarUrl = await uploadUserAvatar(currentUser.id, file);

    await updateUserAvatarUrl(currentUser.id, avatarUrl);

    revalidatePath("/dashboard", "layout");

    return {
      success: true,
      message: "Your profile photo was updated.",
      data: { avatarUrl },
    };
  } catch (error) {
    if (error instanceof ProfileUpdateError) {
      return { success: false, message: error.message };
    }

    console.error("updateProfileAvatarAction failed", error);

    return {
      success: false,
      message: "We couldn't upload that image. Please try again.",
    };
  }
}

export async function removeProfileAvatarAction(): Promise<UpdateAvatarResult> {
  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be signed in to update your profile.",
    };
  }

  try {
    await deleteUserAvatar(currentUser.id);

    await updateUserAvatarUrl(currentUser.id, null);

    revalidatePath("/dashboard", "layout");

    return {
      success: true,
      message: "Your profile photo was removed.",
      data: { avatarUrl: null },
    };
  } catch (error) {
    if (error instanceof ProfileUpdateError) {
      return { success: false, message: error.message };
    }

    console.error("removeProfileAvatarAction failed", error);

    return {
      success: false,
      message: "We couldn't remove that image. Please try again.",
    };
  }
}
