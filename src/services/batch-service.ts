import "server-only";

import {
  BatchStatus,
  EnrollmentStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

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
              status: {
                not: EnrollmentStatus.CANCELLED,
              },
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
              status: {
                not: EnrollmentStatus.CANCELLED,
              },
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