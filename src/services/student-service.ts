import "server-only";

import {
  EnrollmentStatus,
  Prisma,
  UserRole,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import type {
  AuthenticatedCrmUser,
} from "@/services/user-service";

export type StudentListItem = {
  enrollmentId: string;
  leadId: string;
  fullName: string;
  email: string;
  phone: string;
  courseTitle: string;
  batchId: string;
  batchTitle: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  droppedAt: string | null;
  dropReason: string | null;
  assignedCounselor: string;
};

export type StudentListFilters = {
  search?: string;
  batchId?: string;
  courseId?: string;
  status?: EnrollmentStatus;
};

/**
 * Every enrollment a lead has ever had — active, completed, dropped, or
 * cancelled — scoped the same way the Leads page already is: an admin
 * sees every student, a counselor sees only students from leads
 * assigned to them.
 */
export async function listStudents(
  currentUser: Pick<AuthenticatedCrmUser, "id" | "role">,
  filters: StudentListFilters = {},
): Promise<StudentListItem[]> {
  const isAdminUser = currentUser.role === UserRole.ADMIN;

  const leadWhere: Prisma.LeadWhereInput = {
    ...(isAdminUser
      ? {}
      : {
          assignedCounselorId: currentUser.id,
        }),

    ...(filters.search
      ? {
          OR: [
            {
              fullName: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: filters.search,
                mode: "insensitive",
              },
            },
            {
              phone: {
                contains: filters.search,
              },
            },
          ],
        }
      : {}),
  };

  const enrollments = await prisma.enrollment.findMany({
    where: {
      ...(filters.batchId
        ? { batchId: filters.batchId }
        : {}),

      ...(filters.status
        ? { status: filters.status }
        : {}),

      ...(filters.courseId
        ? { batch: { courseId: filters.courseId } }
        : {}),

      lead: leadWhere,
    },

    select: {
      id: true,
      leadId: true,
      batchId: true,
      enrolledAt: true,
      status: true,
      droppedAt: true,
      dropReason: true,

      lead: {
        select: {
          fullName: true,
          email: true,
          phone: true,

          assignedCounselor: {
            select: {
              fullName: true,
            },
          },
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

    orderBy: {
      enrolledAt: "desc",
    },
  });

  return enrollments.map((enrollment) => ({
    enrollmentId: enrollment.id,
    leadId: enrollment.leadId,
    fullName: enrollment.lead.fullName,
    email: enrollment.lead.email ?? "",
    phone: enrollment.lead.phone,
    courseTitle: enrollment.batch.course.title,
    batchId: enrollment.batchId,
    batchTitle: enrollment.batch.title,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt.toISOString(),
    droppedAt: enrollment.droppedAt?.toISOString() ?? null,
    dropReason: enrollment.dropReason,

    assignedCounselor:
      enrollment.lead.assignedCounselor?.fullName ?? "Unassigned",
  }));
}
