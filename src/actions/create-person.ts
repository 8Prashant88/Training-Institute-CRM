"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { AuthorizationError, requireAdmin } from "@/lib/authorization";
import {
  createPerson,
  PersonAlreadyExistsError,
  SupabaseAdminError,
  type PersonListItem,
} from "@/services/people-service";
import { getCurrentAuthenticatedUser } from "@/services/user-service";
import {
  createPersonSchema,
  type CreatePersonInput,
} from "@/validations/person-schema";

type CreatePersonFieldErrors = Partial<Record<keyof CreatePersonInput, string>>;

export type CreatePersonActionResult =
  | {
      success: true;
      message: string;
      data: PersonListItem;
      temporaryPassword: string;
      fieldErrors: Record<string, never>;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors: CreatePersonFieldErrors;
    };

export async function submitCreatePerson(
  input: unknown,
): Promise<CreatePersonActionResult> {
  const result = createPersonSchema.safeParse(input);

  if (!result.success) {
    const errors = z.flattenError(result.error);

    return {
      success: false,
      message: "The submitted person contains validation errors.",
      fieldErrors: {
        fullName: errors.fieldErrors.fullName?.[0],
        email: errors.fieldErrors.email?.[0],
        role: errors.fieldErrors.role?.[0],
      },
    };
  }

  try {
    const currentUser = await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        success: false,
        message: "You must be signed in to add a person.",
        fieldErrors: {},
      };
    }

    requireAdmin(currentUser);

    const { person, temporaryPassword } = await createPerson(result.data);

    revalidatePath("/dashboard/people");

    return {
      success: true,
      message: `${person.fullName} was added successfully.`,
      data: person,
      temporaryPassword,
      fieldErrors: {},
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        message: "Only administrators can add people.",
        fieldErrors: {},
      };
    }

    if (error instanceof PersonAlreadyExistsError) {
      return {
        success: false,
        message: "A person with this email already exists.",
        fieldErrors: { email: "This email is already registered." },
      };
    }

    if (error instanceof SupabaseAdminError) {
      console.error("submitCreatePerson Supabase admin error", error);

      return {
        success: false,
        message: `Unable to create the login account: ${error.message}`,
        fieldErrors: {},
      };
    }

    console.error("submitCreatePerson failed", error);

    return {
      success: false,
      message: "The server could not create this person. Please try again.",
      fieldErrors: {},
    };
  }
}
