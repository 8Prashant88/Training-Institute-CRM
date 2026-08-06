import "server-only";

import {
  BatchStatus,
  EnrollmentStatus,
  LeadStatus,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type EnrollmentErrorCode =
  | "LEAD_NOT_FOUND"
  | "ALREADY_ENROLLED"
  | "BATCH_NOT_FOUND"
  | "BATCH_UNAVAILABLE"
  | "BATCH_FULL";

export class EnrollmentServiceError extends Error {
  readonly code: EnrollmentErrorCode;

  constructor(
    code: EnrollmentErrorCode,
    message: string,
  ) {
    super(message);

    this.name = "EnrollmentServiceError";
    this.code = code;
  }
}

export type EnrollLeadInput = {
  leadId: string;
  batchId: string;
};

export type EnrollmentDetails = {
  id: string;
  leadId: string;
  batchId: string;
  batchTitle: string;
  courseTitle: string;
  enrolledAt: string;
  status: EnrollmentStatus;
};

export async function enrollLead(
  input: EnrollLeadInput,
): Promise<EnrollmentDetails> {
  return prisma.$transaction(
    async (transaction) => {
      const lead =
        await transaction.lead.findFirst({
          where: {
            id: input.leadId,
            archivedAt: null,
          },

          select: {
            id: true,
            status: true,
            interestedCourseId: true,

            enrollment: {
              select: {
                id: true,
              },
            },
          },
        });

      if (!lead) {
        throw new EnrollmentServiceError(
          "LEAD_NOT_FOUND",
          "The lead was not found or has been archived.",
        );
      }

      if (
        lead.enrollment ||
        lead.status === LeadStatus.ENROLLED
      ) {
        throw new EnrollmentServiceError(
          "ALREADY_ENROLLED",
          "This lead already has an enrollment.",
        );
      }

      const batch =
        await transaction.batch.findUnique({
          where: {
            id: input.batchId,
          },

          select: {
            id: true,
            title: true,
            courseId: true,
            capacity: true,
            status: true,

            course: {
              select: {
                title: true,
              },
            },
          },
        });

      if (!batch) {
        throw new EnrollmentServiceError(
          "BATCH_NOT_FOUND",
          "The selected batch was not found.",
        );
      }

      const acceptsEnrollments =
        batch.status === BatchStatus.UPCOMING ||
        batch.status === BatchStatus.ONGOING;

      if (!acceptsEnrollments) {
        throw new EnrollmentServiceError(
          "BATCH_UNAVAILABLE",
          "The selected batch is not accepting enrollments.",
        );
      }

      const enrolledCount =
        await transaction.enrollment.count({
          where: {
            batchId: batch.id,

            status: {
              not: EnrollmentStatus.CANCELLED,
            },
          },
        });

      if (
        enrolledCount >= batch.capacity
      ) {
        throw new EnrollmentServiceError(
          "BATCH_FULL",
          "The selected batch has reached its capacity.",
        );
      }

      const enrollment =
        await transaction.enrollment.create({
          data: {
            leadId: lead.id,
            batchId: batch.id,
            status: EnrollmentStatus.ACTIVE,
          },

          select: {
            id: true,
            leadId: true,
            batchId: true,
            enrolledAt: true,
            status: true,
          },
        });

    await transaction.lead.update({
  where: {
    id: lead.id,
  },

  data: {
    status: LeadStatus.ENROLLED,

    // Store the course the lead finally selected.
    interestedCourseId: batch.courseId,

    nextFollowUpAt: null,
  },
});

      return {
        id: enrollment.id,
        leadId: enrollment.leadId,
        batchId: enrollment.batchId,
        batchTitle: batch.title,
        courseTitle: batch.course.title,
        enrolledAt:
          enrollment.enrolledAt.toISOString(),
        status: enrollment.status,
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,
    },
  );
}