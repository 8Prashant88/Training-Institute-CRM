"use server";

import { revalidatePath } from "next/cache";

import { AuthorizationError, requireAdmin } from "@/lib/authorization";
import {
  LastAdminError,
  PersonNotFoundError,
  setPersonRole,
  type PersonListItem,
} from "@/services/people-service";
import { getCurrentAuthenticatedUser } from "@/services/user-service";
import { updatePersonRoleSchema } from "@/validations/person-schema";

export type UpdatePersonRoleActionResult =
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

export async function submitUpdatePersonRole(
  input: unknown,
): Promise<UpdatePersonRoleActionResult> {
  const result = updatePersonRoleSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: "The submitted role change is invalid.",
    };
  }

  try {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        success: false,
        message: "You must be signed in to change a person's role.",
      };
    }

    requireAdmin(currentUser);

    if (result.data.personId === currentUser.id) {
      return {
        success: false,
        message: "You cannot change your own role.",
      };
    }

    const updated = await setPersonRole(
      result.data.personId,
      result.data.role,
    );

    revalidatePath("/dashboard/people");

    return {
      success: true,
      message: `${updated.fullName}'s role was updated.`,
      data: updated,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        message: "Only administrators can change roles.",
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

    console.error("submitUpdatePersonRole failed", error);

    return {
      success: false,
      message: "The server could not update this role. Please try again.",
    };
  }
}
