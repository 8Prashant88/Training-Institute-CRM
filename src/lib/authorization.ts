import "server-only";

import {
  UserRole,
} from "@/generated/prisma/client";

import type {
  AuthenticatedCrmUser,
} from "@/services/user-service";

export class AuthorizationError extends Error {
  readonly code = "FORBIDDEN";

  constructor(
    message = "You are not authorized to perform this action.",
  ) {
    super(message);

    this.name = "AuthorizationError";
  }
}

export function isAdmin(
  user: AuthenticatedCrmUser,
) {
  return user.role === UserRole.ADMIN;
}

export function requireAdmin(
  user: AuthenticatedCrmUser,
) {
  if (!isAdmin(user)) {
    throw new AuthorizationError(
      "Administrator access is required.",
    );
  }
}

export function canAccessLead(
  user: AuthenticatedCrmUser,
  assignedCounselorId: string | null,
) {
  if (isAdmin(user)) {
    return true;
  }

  return (
    user.role === UserRole.COUNSELOR &&
    assignedCounselorId === user.id
  );
}

export function requireLeadAccess(
  user: AuthenticatedCrmUser,
  assignedCounselorId: string | null,
) {
  if (
    !canAccessLead(
      user,
      assignedCounselorId,
    )
  ) {
    throw new AuthorizationError(
      "You do not have access to this lead.",
    );
  }
}