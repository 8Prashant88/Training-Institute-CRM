import "server-only";

import {
  BatchStatus,
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  isBatchLocked,
  isBatchStatusTransitionAllowed,
} from "@/lib/batch-status-rules";
import { OCCUPIES_SEAT_FILTER } from "@/services/enrollment-service";

export type BatchErrorCode =
  | "BATCH_NOT_FOUND"
  | "INVALID_TRANSITION"
  | "BATCH_LOCKED"
  | "CAPACITY_BELOW_ENROLLED";

export class BatchServiceError extends Error {
  readonly code: BatchErrorCode;

  constructor(code: BatchErrorCode, message: string) {
    super(message);

    this.name = "BatchServiceError";
    this.code = code;
  }
}

const batchListItemSelect = {
  id: true,
  title: true,
  capacity: true,
  startDate: true,
  endDate: true,
  status: true,

  course: {
    select: {
      title: true,
    },
  },
} as const;

function toBatchListItem(
  batch: {
    id: string;
    title: string;
    capacity: number;
    startDate: Date;
    endDate: Date;
    status: BatchStatus;
    course: { title: string };
  },
  enrolledCount: number,
): BatchListItem {
  return {
    id: batch.id,
    title: batch.title,
    courseTitle: batch.course.title,
    capacity: batch.capacity,
    enrolledCount,
    startDate: batch.startDate.toISOString(),
    endDate: batch.endDate.toISOString(),
    status: batch.status,
  };
}

export type BatchListItem = {
  id: string;
  title: string;
  courseTitle: string;
  capacity: number;
  enrolledCount: number;
  startDate: string;
  endDate: string;
  status: BatchStatus;
};
export type EnrollmentBatchOption = {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  capacity: number;
  enrolledCount: number;
  remainingSeats: number;
  startDate: string;
  endDate: string;
  status: BatchStatus;
};
export type CreateBatchInput = {
  courseId: string;
  title: string;
  capacity: number;
  startDate: Date;
  endDate: Date;
};

export async function listBatches(): Promise<
  BatchListItem[]
> {
  const databaseBatches = await prisma.batch.findMany({
    select: {
      id: true,
      title: true,
      capacity: true,
      startDate: true,
      endDate: true,
      status: true,

      course: {
        select: {
          title: true,
        },
      },

      _count: {
        select: {
          enrollments: {
            where: {
              status: OCCUPIES_SEAT_FILTER,
            },
          },
        },
      },
    },

    orderBy: [
      {
        startDate: "asc",
      },
      {
        title: "asc",
      },
    ],
  });

  return databaseBatches.map((batch) => ({
    id: batch.id,
    title: batch.title,
    courseTitle: batch.course.title,
    capacity: batch.capacity,
    enrolledCount: batch._count.enrollments,
    startDate: batch.startDate.toISOString(),
    endDate: batch.endDate.toISOString(),
    status: batch.status,
  }));
}
export async function createBatch(
  input: CreateBatchInput,
): Promise<BatchListItem> {
  const createdBatch =
    await prisma.batch.create({
      data: {
        courseId: input.courseId,
        title: input.title.trim(),
        capacity: input.capacity,
        startDate: input.startDate,
        endDate: input.endDate,
        status: "UPCOMING",
      },

      select: {
        id: true,
        title: true,
        capacity: true,
        startDate: true,
        endDate: true,
        status: true,

        course: {
          select: {
            title: true,
          },
        },
      },
    });

  return {
    id: createdBatch.id,
    title: createdBatch.title,
    courseTitle:
      createdBatch.course.title,
    capacity: createdBatch.capacity,
    enrolledCount: 0,
    startDate:
      createdBatch.startDate.toISOString(),
    endDate:
      createdBatch.endDate.toISOString(),
    status: createdBatch.status,
  };
}

export async function listEnrollmentBatchOptions(): Promise<
  EnrollmentBatchOption[]
> {
  const batches = await prisma.batch.findMany({
    where: {
      status: {
        in: [
          BatchStatus.UPCOMING,
          BatchStatus.ONGOING,
        ],
      },
    },

    select: {
      id: true,
      title: true,
      courseId: true,
      capacity: true,
      startDate: true,
      endDate: true,
      status: true,

      course: {
        select: {
          title: true,
        },
      },

      _count: {
        select: {
          enrollments: {
            where: {
              status: OCCUPIES_SEAT_FILTER,
            },
          },
        },
      },
    },

    orderBy: [
      {
        startDate: "asc",
      },
      {
        title: "asc",
      },
    ],
  });

  return batches
    .map((batch) => {
      const enrolledCount =
        batch._count.enrollments;

      return {
        id: batch.id,
        title: batch.title,
        courseId: batch.courseId,
        courseTitle: batch.course.title,
        capacity: batch.capacity,
        enrolledCount,
        remainingSeats:
          batch.capacity - enrolledCount,
        startDate:
          batch.startDate.toISOString(),
        endDate:
          batch.endDate.toISOString(),
        status: batch.status,
      };
    })
    .filter(
      (batch) =>
        batch.remainingSeats > 0,
    );
}

export type UpdateBatchStatusInput = {
  batchId: string;
  status: BatchStatus;
};

/**
 * Moves a batch to a new status, but only along an allowed edge of the
 * lifecycle graph in batch-status-rules.ts. Re-checking the current
 * status inside the same transaction that performs the write (rather
 * than trusting a value read moments earlier by the caller) closes the
 * same kind of race window enrollLead() closes for capacity.
 */
export async function updateBatchStatus(
  input: UpdateBatchStatusInput,
): Promise<BatchListItem> {
  return prisma.$transaction(async (transaction) => {
    const batch = await transaction.batch.findUnique({
      where: {
        id: input.batchId,
      },

      select: {
        status: true,
      },
    });

    if (!batch) {
      throw new BatchServiceError(
        "BATCH_NOT_FOUND",
        "The batch was not found.",
      );
    }

    if (
      !isBatchStatusTransitionAllowed(batch.status, input.status)
    ) {
      throw new BatchServiceError(
        "INVALID_TRANSITION",
        `A batch cannot move from ${batch.status} to ${input.status}.`,
      );
    }

    const updated = await transaction.batch.update({
      where: {
        id: input.batchId,
      },

      data: {
        status: input.status,
      },

      select: {
        ...batchListItemSelect,

        _count: {
          select: {
            enrollments: {
              where: {
                status: OCCUPIES_SEAT_FILTER,
              },
            },
          },
        },
      },
    });

    return toBatchListItem(updated, updated._count.enrollments);
  });
}

export type UpdateBatchDetailsInput = {
  batchId: string;
  title: string;
  capacity: number;
};

/**
 * Updates a batch's title and capacity. Capacity can never drop below
 * the number of currently active (non-cancelled) enrollments, and a
 * completed or cancelled batch can no longer be edited at all — its
 * numbers are history at that point, not a live seat count. Serializable
 * isolation closes the same race as enrollLead(): without it, an admin
 * lowering capacity and a counselor enrolling the last seat could both
 * read a stale enrolled count and each believe their action is safe.
 */
export async function updateBatchDetails(
  input: UpdateBatchDetailsInput,
): Promise<BatchListItem> {
  return prisma.$transaction(
    async (transaction) => {
      const batch = await transaction.batch.findUnique({
        where: {
          id: input.batchId,
        },

        select: {
          status: true,
        },
      });

      if (!batch) {
        throw new BatchServiceError(
          "BATCH_NOT_FOUND",
          "The batch was not found.",
        );
      }

      if (isBatchLocked(batch.status)) {
        throw new BatchServiceError(
          "BATCH_LOCKED",
          "A completed or cancelled batch can no longer be edited.",
        );
      }

      const activeEnrollmentCount =
        await transaction.enrollment.count({
          where: {
            batchId: input.batchId,

            status: OCCUPIES_SEAT_FILTER,
          },
        });

      if (input.capacity < activeEnrollmentCount) {
        throw new BatchServiceError(
          "CAPACITY_BELOW_ENROLLED",
          `Capacity cannot be lower than the ${activeEnrollmentCount} lead(s) already enrolled in this batch.`,
        );
      }

      const updated = await transaction.batch.update({
        where: {
          id: input.batchId,
        },

        data: {
          title: input.title.trim(),
          capacity: input.capacity,
        },

        select: batchListItemSelect,
      });

      return toBatchListItem(updated, activeEnrollmentCount);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}