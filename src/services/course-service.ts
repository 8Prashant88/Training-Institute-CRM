import "server-only";

import {
  CourseStatus,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

export type CourseErrorCode = "COURSE_NOT_FOUND";

export class CourseServiceError extends Error {
  readonly code: CourseErrorCode;

  constructor(code: CourseErrorCode, message: string) {
    super(message);

    this.name = "CourseServiceError";
    this.code = code;
  }
}

export type CourseRecord = {
  id: string;
  title: string;
  duration: string;
  status: CourseStatus;
};

export type CourseManagementItem = CourseRecord & {
  batchCount: number;
};

const courseRecordSelect = {
  id: true,
  title: true,
  duration: true,
  status: true,
} as const;

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

/**
 * Admin-facing course list: includes inactive courses and how many
 * batches reference each one, so deactivating a heavily-used course is
 * an informed decision rather than a guess.
 */
export async function listCoursesForManagement(): Promise<
  CourseManagementItem[]
> {
  const courses = await prisma.course.findMany({
    select: {
      ...courseRecordSelect,

      _count: {
        select: {
          batches: true,
        },
      },
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

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    duration: course.duration,
    status: course.status,
    batchCount: course._count.batches,
  }));
}

export type CreateCourseInput = {
  title: string;
  duration: string;
};

export async function createCourse(
  input: CreateCourseInput,
): Promise<CourseRecord> {
  return prisma.course.create({
    data: {
      title: input.title.trim(),
      duration: input.duration.trim(),
      status: CourseStatus.ACTIVE,
    },

    select: courseRecordSelect,
  });
}

export type UpdateCourseInput = {
  title: string;
  duration: string;
};

export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput,
): Promise<CourseRecord> {
  return prisma.course.update({
    where: {
      id: courseId,
    },

    data: {
      title: input.title.trim(),
      duration: input.duration.trim(),
    },

    select: courseRecordSelect,
  });
}

/**
 * Flips ACTIVE <-> INACTIVE. Takes only a courseId (never a target status
 * from the client) and reads the current value itself, so a tampered
 * request body can never force a course into an arbitrary status.
 * Deactivating does not touch existing batches or enrollments — it only
 * removes the course from new-batch and public-inquiry course pickers.
 */
export async function toggleCourseStatus(
  courseId: string,
): Promise<CourseRecord> {
  return prisma.$transaction(async (transaction) => {
    const course = await transaction.course.findUnique({
      where: {
        id: courseId,
      },

      select: {
        id: true,
        status: true,
      },
    });

    if (!course) {
      throw new CourseServiceError(
        "COURSE_NOT_FOUND",
        "The course was not found.",
      );
    }

    const nextStatus =
      course.status === CourseStatus.ACTIVE
        ? CourseStatus.INACTIVE
        : CourseStatus.ACTIVE;

    return transaction.course.update({
      where: {
        id: courseId,
      },

      data: {
        status: nextStatus,
      },

      select: courseRecordSelect,
    });
  });
}