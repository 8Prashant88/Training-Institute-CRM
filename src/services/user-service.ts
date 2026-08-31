import "server-only";

import {
  UserRole,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type CounselorOption = {
  id: string;
  fullName: string;
  email: string;
};

export type AuthenticatedCrmUser = {
  id: string;
  authUserId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
};

export type ProfileUpdateErrorCode = "USER_NOT_FOUND";

export class ProfileUpdateError extends Error {
  readonly code: ProfileUpdateErrorCode;

  constructor(code: ProfileUpdateErrorCode, message: string) {
    super(message);

    this.name = "ProfileUpdateError";
    this.code = code;
  }
}

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

export type CounselorFilterOption = {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
};

export async function listCounselorsForLeadFilters(): Promise<
  CounselorFilterOption[]
> {
  return prisma.user.findMany({
    where: {
      role: UserRole.COUNSELOR,
    },

    select: {
      id: true,
      fullName: true,
      email: true,
      isActive: true,
    },

    orderBy: [
      {
        isActive: "desc",
      },
      {
        fullName: "asc",
      },
    ],
  });
}
export async function findOrLinkAuthenticatedUser(
  authUserId: string,
  email: string,
): Promise<AuthenticatedCrmUser | null> {
  const normalizedEmail =
    email.trim().toLowerCase();

  const alreadyLinkedUser =
    await prisma.user.findUnique({
      where: {
        authUserId,
      },

      select: {
        id: true,
        authUserId: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        isActive: true,
      },
    });

  if (alreadyLinkedUser) {
    if (
      !alreadyLinkedUser.isActive ||
      !alreadyLinkedUser.authUserId
    ) {
      return null;
    }

    return {
      ...alreadyLinkedUser,
      authUserId:
        alreadyLinkedUser.authUserId,
    };
  }

  const userWithMatchingEmail =
    await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },

      select: {
        id: true,
        authUserId: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        isActive: true,
      },
    });

  if (
    !userWithMatchingEmail ||
    !userWithMatchingEmail.isActive
  ) {
    return null;
  }

  if (
    userWithMatchingEmail.authUserId &&
    userWithMatchingEmail.authUserId !==
      authUserId
  ) {
    return null;
  }

  const linkedUser =
    await prisma.user.update({
      where: {
        id: userWithMatchingEmail.id,
      },

      data: {
        authUserId,
      },

      select: {
        id: true,
        authUserId: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        isActive: true,
      },
    });

  if (!linkedUser.authUserId) {
    return null;
  }

  return {
    ...linkedUser,
    authUserId: linkedUser.authUserId,
  };
}

export async function getCurrentAuthenticatedUser(): Promise<
  AuthenticatedCrmUser | null
> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const crmUser = await prisma.user.findUnique({
    where: {
      authUserId: user.id,
    },

    select: {
      id: true,
      authUserId: true,
      fullName: true,
      email: true,
      avatarUrl: true,
      role: true,
      isActive: true,
    },
  });

  if (
    !crmUser ||
    !crmUser.authUserId ||
    !crmUser.isActive
  ) {
    return null;
  }

  return {
    id: crmUser.id,
    authUserId: crmUser.authUserId,
    fullName: crmUser.fullName,
    email: crmUser.email,
    avatarUrl: crmUser.avatarUrl,
    role: crmUser.role,
    isActive: crmUser.isActive,
  };
}

function toAuthenticatedCrmUser(user: {
  id: string;
  authUserId: string | null;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
}): AuthenticatedCrmUser {
  if (!user.authUserId) {
    throw new ProfileUpdateError(
      "USER_NOT_FOUND",
      "We couldn't find your user account.",
    );
  }

  return {
    ...user,
    authUserId: user.authUserId,
  };
}

export async function updateUserFullName(
  userId: string,
  fullName: string,
): Promise<AuthenticatedCrmUser> {
  try {
    const updated = await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        fullName,
      },

      select: {
        id: true,
        authUserId: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        isActive: true,
      },
    });

    return toAuthenticatedCrmUser(updated);
  } catch (error) {
    if (error instanceof ProfileUpdateError) {
      throw error;
    }

    throw new ProfileUpdateError(
      "USER_NOT_FOUND",
      "We couldn't find your user account.",
    );
  }
}

export async function updateUserAvatarUrl(
  userId: string,
  avatarUrl: string | null,
): Promise<AuthenticatedCrmUser> {
  try {
    const updated = await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        avatarUrl,
      },

      select: {
        id: true,
        authUserId: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        isActive: true,
      },
    });

    return toAuthenticatedCrmUser(updated);
  } catch (error) {
    if (error instanceof ProfileUpdateError) {
      throw error;
    }

    throw new ProfileUpdateError(
      "USER_NOT_FOUND",
      "We couldn't find your user account.",
    );
  }
}