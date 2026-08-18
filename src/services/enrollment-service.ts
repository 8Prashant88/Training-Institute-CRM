import "server-only";

import {
  BatchStatus,
  EnrollmentStatus,
  LeadActivityType,
  LeadStatus,
  Prisma,
  UserRole,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { notifyLeadEnrolled } from "@/services/notification-service";

/**
 * A cancelled or dropped seat no longer counts against a batch's
 * capacity — both free the seat for someone else. This filter is the
 * single definition of "currently occupies a seat"; every capacity
 * count in this file and batch-service.ts uses it.
 */
export const OCCUPIES_SEAT_FILTER = {
  notIn: [EnrollmentStatus.CANCELLED, EnrollmentStatus.DROPPED],
};

export type EnrollmentErrorCode =
  | "LEAD_NOT_FOUND"
  | "FORBIDDEN"
  | "ALREADY_ENROLLED"
  | "BATCH_NOT_FOUND"
  | "BATCH_UNAVAILABLE"
  | "BATCH_ENDED"
  | "BATCH_FULL"
  | "ENROLLMENT_NOT_FOUND"
  | "NOT_ACTIVE";

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

  actor: {
    id: string;
    role: UserRole;
  };
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
            fullName: true,
            status: true,
            interestedCourseId: true,
            assignedCounselorId: true,

            /*
             * A lead can have many historical Enrollment rows now (drop
             * and re-enroll, or a second course after completing the
             * first), so "already enrolled" means "has an ACTIVE one
             * right now" — not "has ever had one". The database backs
             * this same rule with a partial unique index on
             * (leadId) WHERE status = 'ACTIVE', so this application
             * check and that index protect the same fact for the two
             * usual reasons: a friendly message here, a guarantee that
             * holds even under a concurrent write there.
             */
            enrollments: {
              where: {
                status: EnrollmentStatus.ACTIVE,
              },

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

      const canEnrollLead =
        input.actor.role === UserRole.ADMIN ||
        lead.assignedCounselorId ===
          input.actor.id;

      if (!canEnrollLead) {
        throw new EnrollmentServiceError(
          "FORBIDDEN",
          "You are not authorized to enroll this lead.",
        );
      }

      if (lead.enrollments.length > 0) {
        throw new EnrollmentServiceError(
          "ALREADY_ENROLLED",
          "This lead already has an active enrollment.",
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
            endDate: true,

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

      /*
       * Application rule: `status` should already say UPCOMING/ONGOING
       * for a schedule that hasn't ended. Database rule: check the date
       * itself too, because an admin can forget to mark a batch
       * COMPLETED after its endDate passes, and this transaction is the
       * last line of defense before an enrollment is created against a
       * course that has already finished.
       *
       * `endDate` is stored as a date-only column, so Prisma returns it
       * as midnight UTC on that day. Comparing it directly against "now"
       * would treat the batch's own last day as already over; the
       * batch's final day should still accept enrollments through its
       * end, so the comparison is against the end of that UTC day.
       */
      const endOfBatchDay = new Date(
        Date.UTC(
          batch.endDate.getUTCFullYear(),
          batch.endDate.getUTCMonth(),
          batch.endDate.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      );

      if (endOfBatchDay < new Date()) {
        throw new EnrollmentServiceError(
          "BATCH_ENDED",
          "The selected batch has already ended and cannot accept new enrollments.",
        );
      }

      const enrolledCount =
        await transaction.enrollment.count({
          where: {
            batchId: batch.id,
            status: OCCUPIES_SEAT_FILTER,
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

          interestedCourseId:
            batch.courseId,

          nextFollowUpAt: null,
        },
      });

      await notifyLeadEnrolled(transaction, {
        lead: {
          id: lead.id,
          fullName: lead.fullName,
          assignedCounselorId: lead.assignedCounselorId,
        },

        courseTitle: batch.course.title,
        batchTitle: batch.title,
        actorId: input.actor.id,
      });

      return {
        id: enrollment.id,
        leadId: enrollment.leadId,
        batchId: enrollment.batchId,
        batchTitle: batch.title,
        courseTitle:
          batch.course.title,

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

export type EnrollmentSummary = {
  id: string;
  leadId: string;
  batchId: string;
  batchTitle: string;
  courseTitle: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  droppedAt: string | null;
  dropReason: string | null;
};

type ManageEnrollmentActor = {
  id: string;
  role: UserRole;
};

async function loadManageableEnrollment(
  transaction: Prisma.TransactionClient,
  enrollmentId: string,
  actor: ManageEnrollmentActor,
) {
  const enrollment = await transaction.enrollment.findUnique({
    where: {
      id: enrollmentId,
    },

    select: {
      id: true,
      leadId: true,
      batchId: true,
      status: true,
      enrolledAt: true,

      lead: {
        select: {
          assignedCounselorId: true,
        },
      },

      batch: {
        select: {
          title: true,

          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    throw new EnrollmentServiceError(
      "ENROLLMENT_NOT_FOUND",
      "The enrollment was not found.",
    );
  }

  const canManage =
    actor.role === UserRole.ADMIN ||
    enrollment.lead.assignedCounselorId === actor.id;

  if (!canManage) {
    throw new EnrollmentServiceError(
      "FORBIDDEN",
      "You are not authorized to manage this enrollment.",
    );
  }

  if (enrollment.status !== EnrollmentStatus.ACTIVE) {
    throw new EnrollmentServiceError(
      "NOT_ACTIVE",
      "Only an active enrollment can be updated this way.",
    );
  }

  return enrollment;
}

export type DropEnrollmentInput = {
  enrollmentId: string;
  reason?: string;
  actor: ManageEnrollmentActor;
};

/**
 * Marks an active enrollment as DROPPED and frees its seat. Because
 * dropping is a pipeline event as much as an enrollment event, the
 * lead moves back to FOLLOW_UP (from ENROLLED, which is the only
 * status an actively-enrolled lead can be in) so a counselor sees it
 * again as something to act on, and the move is written to the same
 * LeadActivity audit trail as every other status change.
 */
export async function dropEnrollment(
  input: DropEnrollmentInput,
): Promise<EnrollmentDetails> {
  return prisma.$transaction(async (transaction) => {
    const enrollment = await loadManageableEnrollment(
      transaction,
      input.enrollmentId,
      input.actor,
    );

    const droppedAt = new Date();
    const trimmedReason = input.reason?.trim() || null;

    const updated = await transaction.enrollment.update({
      where: {
        id: enrollment.id,
      },

      data: {
        status: EnrollmentStatus.DROPPED,
        droppedAt,
        dropReason: trimmedReason,
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
        id: enrollment.leadId,
      },

      data: {
        status: LeadStatus.FOLLOW_UP,
      },
    });

    await transaction.leadActivity.create({
      data: {
        leadId: enrollment.leadId,
        type: LeadActivityType.STATUS_CHANGE,
        fromStatus: LeadStatus.ENROLLED,
        toStatus: LeadStatus.FOLLOW_UP,
        changedById: input.actor.id,

        note: trimmedReason
          ? `Dropped from ${enrollment.batch.title}: ${trimmedReason}`
          : `Dropped from ${enrollment.batch.title}.`,
      },
    });

    return {
      id: updated.id,
      leadId: updated.leadId,
      batchId: updated.batchId,
      batchTitle: enrollment.batch.title,
      courseTitle: enrollment.batch.course.title,
      enrolledAt: updated.enrolledAt.toISOString(),
      status: updated.status,
    };
  });
}

export type CompleteEnrollmentInput = {
  enrollmentId: string;
  actor: ManageEnrollmentActor;
};

/**
 * Marks an active enrollment as COMPLETED. The lead's status stays
 * ENROLLED — completion is a success outcome, not something that
 * needs to reopen the pipeline — so no LeadActivity entry is written;
 * the Enrollment row itself (status + updatedAt) is that record.
 */
export async function completeEnrollment(
  input: CompleteEnrollmentInput,
): Promise<EnrollmentDetails> {
  return prisma.$transaction(async (transaction) => {
    const enrollment = await loadManageableEnrollment(
      transaction,
      input.enrollmentId,
      input.actor,
    );

    const updated = await transaction.enrollment.update({
      where: {
        id: enrollment.id,
      },

      data: {
        status: EnrollmentStatus.COMPLETED,
      },

      select: {
        id: true,
        leadId: true,
        batchId: true,
        enrolledAt: true,
        status: true,
      },
    });

    return {
      id: updated.id,
      leadId: updated.leadId,
      batchId: updated.batchId,
      batchTitle: enrollment.batch.title,
      courseTitle: enrollment.batch.course.title,
      enrolledAt: updated.enrolledAt.toISOString(),
      status: updated.status,
    };
  });
}