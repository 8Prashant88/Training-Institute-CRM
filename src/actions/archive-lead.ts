"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  archiveLead,
  type ArchivedLead,
} from "@/services/lead-service";

const archiveLeadSchema = z.object({
  leadId: z.uuid({
    error: "The lead ID is invalid.",
  }),
});

export type ArchiveLeadInput = z.infer<
  typeof archiveLeadSchema
>;

type ArchiveLeadFieldErrors = Partial<
  Record<keyof ArchiveLeadInput, string>
>;

export type ArchiveLeadResult =
  | {
      success: true;
      message: string;
      data: ArchivedLead;
      fieldErrors: Record<string, never>;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors: ArchiveLeadFieldErrors;
    };

function isRecordNotFoundError(
  error: unknown,
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2025"
  );
}

export async function submitArchiveLead(
  input: unknown,
): Promise<ArchiveLeadResult> {
  const result = archiveLeadSchema.safeParse(input);

  if (!result.success) {
    const errors = z.flattenError(result.error);

    return {
      success: false,
      message:
        "The submitted archive request is invalid.",
      fieldErrors: {
        leadId:
          errors.fieldErrors.leadId?.[0],
      },
    };
  }

  try {
    const archivedLead = await archiveLead(
      result.data.leadId,
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath(
      `/dashboard/leads/${archivedLead.id}`,
    );

    return {
      success: true,
      message:
        "Lead archived successfully.",
      data: archivedLead,
      fieldErrors: {},
    };
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return {
        success: false,
        message:
          "The lead was not found or has already been archived.",
        fieldErrors: {},
      };
    }

    console.error(
      "submitArchiveLead failed",
      error,
    );

    return {
      success: false,
      message:
        "The server could not archive the lead. Please try again.",
      fieldErrors: {},
    };
  }
}