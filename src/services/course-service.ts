import "server-only";

import {
  CourseStatus,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

export async function listActiveCourses() {
  return prisma.course.findMany({
    where: {
      status: CourseStatus.ACTIVE,
    },

    select: {
      id: true,
      title: true,
      duration: true,
      status: true,
    },

    orderBy: {
      title: "asc",
    },
  });
}

export type CourseFilterOption = {
  id: string;
  title: string;
  status: CourseStatus;
};

export async function listCoursesForLeadFilters(): Promise<
  CourseFilterOption[]
> {
  return prisma.course.findMany({
    select: {
      id: true,
      title: true,
      status: true,
    },

    orderBy: [
      {
        status: "asc",
      },
      {
        title: "asc",
      },
    ],
  });
}