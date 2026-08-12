"use server";

import {
  revalidatePath,
} from "next/cache";

import * as z from "zod";

import {
  enrollLead,
  EnrollmentServiceError,
  type EnrollmentDetails,
  type EnrollLeadInput,
} from "@/services/enrollment-service";

import {
  getCurrentAuthenticatedUser,
} from "@/services/user-service";

const enrollLeadSchema = z.object({
  leadId: z.uuid({
    error:
      "The lead ID is invalid.",
  }),

  batchId: z.uuid({
    error:
      "Select a valid batch.",
  }),
});

export type EnrollLeadActionInput =
  z.infer<
    typeof enrollLeadSchema
  >;

type EnrollLeadFieldErrors =
  Partial<
    Record<
      keyof EnrollLeadActionInput,
      string
    >
  >;

export type EnrollLeadActionResult =
  | {
      success: true;
      message: string;
      data: EnrollmentDetails;

      fieldErrors: Record<
        string,
        never
      >;
    }
  | {
      success: false;
      message: string;
      data?: undefined;

      fieldErrors:
        EnrollLeadFieldErrors;
    };

function getDatabaseErrorCode(
  error: unknown,
): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return undefined;
}

async function enrollWithRetry(
  input: EnrollLeadInput,
): Promise<EnrollmentDetails> {
  const maximumAttempts = 3;

  for (
    let attempt = 1;
    attempt <= maximumAttempts;
    attempt += 1
  ) {
    try {
      return await enrollLead(input);
    } catch (error) {
      const isTransactionConflict =
        getDatabaseErrorCode(
          error,
        ) === "P2034";

      if (
        !isTransactionConflict ||
        attempt === maximumAttempts
      ) {
        throw error;
      }
    }
  }

  throw new Error(
    "Enrollment retry attempts were exhausted.",
  );
}

export async function submitEnrollment(
  input: unknown,
): Promise<EnrollLeadActionResult> {
  const result =
    enrollLeadSchema.safeParse(
      input,
    );

  if (!result.success) {
    const errors =
      z.flattenError(
        result.error,
      );

    return {
      success: false,

      message:
        "The enrollment request contains validation errors.",

      fieldErrors: {
        leadId:
          errors.fieldErrors
            .leadId?.[0],

        batchId:
          errors.fieldErrors
            .batchId?.[0],
      },
    };
  }

  try {
    const currentUser =
      await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        success: false,

        message:
          "You must be signed in to enroll a lead.",

        fieldErrors: {},
      };
    }

    const enrollment =
      await enrollWithRetry({
        leadId:
          result.data.leadId,

        batchId:
          result.data.batchId,

        actor: {
          id: currentUser.id,
          role: currentUser.role,
        },
      });

    revalidatePath(
      "/dashboard",
    );

    revalidatePath(
      "/dashboard/leads",
    );

    revalidatePath(
      "/dashboard/batches",
    );

    revalidatePath(
      `/dashboard/leads/${result.data.leadId}`,
    );

    return {
      success: true,

      message:
        "Lead enrolled successfully.",

      data: enrollment,

      fieldErrors: {},
    };
  } catch (error) {
    if (
      error instanceof
      EnrollmentServiceError
    ) {
      switch (error.code) {
        case "LEAD_NOT_FOUND":
          return {
            success: false,
            message:
              error.message,

            fieldErrors: {
              leadId:
                error.message,
            },
          };

        case "FORBIDDEN":
          return {
            success: false,

            message:
              "You are not authorized to enroll this lead.",

            fieldErrors: {
              leadId:
                "You do not have access to this lead.",
            },
          };

        case "ALREADY_ENROLLED":
          return {
            success: false,
            message:
              error.message,

            fieldErrors: {
              leadId:
                error.message,
            },
          };

        case "BATCH_NOT_FOUND":
        case "BATCH_UNAVAILABLE":
        case "BATCH_ENDED":
        case "BATCH_FULL":
          return {
            success: false,
            message:
              error.message,

            fieldErrors: {
              batchId:
                error.message,
            },
          };
      }
    }

    const databaseErrorCode =
      getDatabaseErrorCode(
        error,
      );

    if (
      databaseErrorCode ===
      "P2002"
    ) {
      return {
        success: false,

        message:
          "This lead already has an enrollment.",

        fieldErrors: {
          leadId:
            "The lead cannot be enrolled twice.",
        },
      };
    }

    if (
      databaseErrorCode ===
      "P2034"
    ) {
      return {
        success: false,

        message:
          "Another enrollment changed the batch capacity. Please try again.",

        fieldErrors: {
          batchId:
            "Refresh the available batch information.",
        },
      };
    }

    console.error(
      "submitEnrollment failed",
      error,
    );

    return {
      success: false,

      message:
        "The server could not complete the enrollment. Please try again.",

      fieldErrors: {},
    };
  }
}