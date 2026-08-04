import "server-only";

import {
  EnrollmentStatus,
  type BatchStatus,
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