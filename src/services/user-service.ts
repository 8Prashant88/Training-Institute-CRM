import "server-only";

import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CounselorOption = {
  id: string;
  fullName: string;
  email: string;
};

export async function listActiveCounselors(): Promise<
  CounselorOption[]
> {
  return prisma.user.findMany({
    where: {
      role: UserRole.COUNSELOR,
      isActive: true,
    },

    select: {
      id: true,
      fullName: true,
      email: true,
    },

    orderBy: {
      fullName: "asc",
    },
  });
}