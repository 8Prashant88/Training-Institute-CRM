"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createLeadNote,
  type LeadNoteDetails,
} from "@/services/lead-service";

const createLeadNoteSchema = z.object({
  leadId: z.uuid({
    error: "The lead ID is invalid.",
  }),

  authorId: z.uuid({
    error: "Select a valid note author.",
  }),

  note: z
    .string()
    .trim()
    .min(3, {
      error: "The note must contain at least 3 characters.",
    })
    .max(2000, {
      error: "The note cannot exceed 2,000 characters.",
    }),
});

export type CreateLeadNoteActionInput = z.infer<
  typeof createLeadNoteSchema
>;

type CreateLeadNoteFieldErrors = Partial<
  Record<keyof CreateLeadNoteActionInput, string>
>;

export type CreateLeadNoteActionResult =
  | {
      success: true;
      message: string;
      data: LeadNoteDetails;
      fieldErrors: Record<string, never>;
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
  const result = createLeadNoteSchema.safeParse(input);

  if (!result.success) {
    const errors = z.flattenError(result.error);

    return {
      success: false,
      message: "The submitted note contains validation errors.",
      fieldErrors: {
        leadId: errors.fieldErrors.leadId?.[0],
        authorId: errors.fieldErrors.authorId?.[0],
        note: errors.fieldErrors.note?.[0],
      },
    };
  }

  try {
    const [lead, author] = await Promise.all([
      prisma.lead.findFirst({
        where: {
          id: result.data.leadId,
          archivedAt: null,
        },
        select: {
          id: true,
        },
      }),

      prisma.user.findFirst({
        where: {
          id: result.data.authorId,
          role: UserRole.COUNSELOR,
          isActive: true,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!lead) {
      return {
        success: false,
        message: "The lead was not found or has been archived.",
        fieldErrors: {
          leadId: "Select an active lead.",
        },
      };
    }

    if (!author) {
      return {
        success: false,
        message: "The selected counselor is not available.",
        fieldErrors: {
          authorId: "Select an active counselor.",
        },
      };
    }

    const note = await createLeadNote({
      leadId: result.data.leadId,
      authorId: result.data.authorId,
      note: result.data.note,
    });

    revalidatePath(
      `/dashboard/leads/${result.data.leadId}`,
    );

    return {
      success: true,
      message: "Lead note added successfully.",
      data: note,
      fieldErrors: {},
    };
  } catch (error) {
    console.error("submitLeadNote failed", error);

    return {
      success: false,
      message:
        "The server could not add the note. Please try again.",
      fieldErrors: {},
    };
  }
}