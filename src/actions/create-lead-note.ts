"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import {
  canAccessLead,
} from "@/lib/authorization";

import {
  createLeadNote,
  getLeadById,
  type LeadNoteDetails,
} from "@/services/lead-service";

import {
  getCurrentAuthenticatedUser,
} from "@/services/user-service";

const createLeadNoteSchema = z.object({
  leadId: z.uuid({
    error: "The lead ID is invalid.",
  }),

  note: z
    .string()
    .trim()
    .min(3, {
      error:
        "The note must contain at least 3 characters.",
    })
    .max(2000, {
      error:
        "The note cannot exceed 2,000 characters.",
    }),
});

export type CreateLeadNoteActionInput =
  z.infer<typeof createLeadNoteSchema>;

type CreateLeadNoteFieldErrors = Partial<
  Record<
    keyof CreateLeadNoteActionInput,
    string
  >
>;

export type CreateLeadNoteActionResult =
  | {
      success: true;
      message: string;
      data: LeadNoteDetails;
      fieldErrors: Record<
        string,
        never
      >;
    }
  | {
      success: false;
      message: string;
      data?: undefined;
      fieldErrors: CreateLeadNoteFieldErrors;
    };

export async function submitLeadNote(
  input: unknown,
): Promise<CreateLeadNoteActionResult> {
  const result =
    createLeadNoteSchema.safeParse(input);

  if (!result.success) {
    const errors = z.flattenError(
      result.error,
    );

    return {
      success: false,
      message:
        "The submitted note contains validation errors.",

      fieldErrors: {
        leadId:
          errors.fieldErrors.leadId?.[0],

        note:
          errors.fieldErrors.note?.[0],
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
          "You must be signed in to add a note.",
        fieldErrors: {},
      };
    }

    const lead = await getLeadById(
      result.data.leadId,
    );

    if (!lead) {
      return {
        success: false,
        message:
          "The lead was not found or has been archived.",
        fieldErrors: {},
      };
    }

    const hasAccess = canAccessLead(
      currentUser,
      lead.assignedCounselor?.id ??
        null,
    );

    if (!hasAccess) {
      return {
        success: false,
        message:
          "You are not authorized to add notes to this lead.",
        fieldErrors: {},
      };
    }

    const note = await createLeadNote({
      leadId: result.data.leadId,

      // IMPORTANT:
      // Never trust authorId from browser.
      authorId: currentUser.id,

      note: result.data.note,
    });

    revalidatePath(
      `/dashboard/leads/${result.data.leadId}`,
    );

    return {
      success: true,
      message:
        "Lead note added successfully.",
      data: note,
      fieldErrors: {},
    };
  } catch (error) {
    console.error(
      "submitLeadNote failed",
      error,
    );

    return {
      success: false,
      message:
        "The server could not add the note. Please try again.",
      fieldErrors: {},
    };
  }
}