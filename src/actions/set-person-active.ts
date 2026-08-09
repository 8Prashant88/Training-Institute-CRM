"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { AuthorizationError, requireAdmin } from "@/lib/authorization";
import {
  LastAdminError,
  PersonNotFoundError,
  setPersonActive,
  type PersonListItem,
} from "@/services/people-service";
import { getCurrentAuthenticatedUser } from "@/services/user-service";
import { setPersonActiveSchema } from "@/validations/person-schema";

const inputSchema = setPersonActiveSchema.extend({
  isActive: z.boolean(),
});

export type SetPersonActiveActionResult =
  | {
      success: true;
      message: string;
      data: PersonListItem;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
    };

export async function submitSetPersonActive(
  input: unknown,
): Promise<SetPersonActiveActionResult> {
  const result = inputSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "The submitted request is invalid.",
    };
  }

  try {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        success: false,
        message: "You must be signed in to manage people.",
      };
    }

    requireAdmin(currentUser);

    if (
      result.data.personId === currentUser.id &&
      !result.data.isActive
    ) {
      return {
        success: false,
        message: "You cannot deactivate your own account.",
      };
    }

    const updated = await setPersonActive(
      result.data.personId,
      result.data.isActive,
    );

    revalidatePath("/dashboard/people");

    return {
      success: true,
      message: result.data.isActive
        ? `${updated.fullName} was reactivated.`
        : `${updated.fullName} was deactivated.`,
      data: updated,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        message: "Only administrators can manage people.",
      };
    }

    if (error instanceof LastAdminError) {
      return {
        success: false,
        message: "At least one active administrator must remain.",
      };
    }

    if (error instanceof PersonNotFoundError) {
      return {
        success: false,
        message: "This person was not found.",
      };
    }

    console.error("submitSetPersonActive failed", error);

    return {
      success: false,
      message: "The server could not update this person. Please try again.",
    };
  }
}
