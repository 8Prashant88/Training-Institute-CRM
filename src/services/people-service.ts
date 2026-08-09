import "server-only";

import { randomBytes } from "crypto";

import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export class PersonNotFoundError extends Error {
  constructor() {
    super("The person was not found.");
    this.name = "PersonNotFoundError";
  }
}

export class PersonAlreadyExistsError extends Error {
  constructor() {
    super("A person with this email already exists.");
    this.name = "PersonAlreadyExistsError";
  }
}

export class LastAdminError extends Error {
  constructor() {
    super("At least one active administrator must remain.");
    this.name = "LastAdminError";
  }
}

export class SupabaseAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseAdminError";
  }
}

export type PersonListItem = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  hasLoginAccess: boolean;
  assignedLeadCount: number;
  createdAt: Date;
};

const personSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  isActive: true,
  authUserId: true,
  createdAt: true,
  _count: {
    select: {
      assignedLeads: true,
    },
  },
} as const;

type RawPerson = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  authUserId: string | null;
  createdAt: Date;
  _count: { assignedLeads: number };
};

function toPersonListItem(raw: RawPerson): PersonListItem {
  return {
    id: raw.id,
    fullName: raw.fullName,
    email: raw.email,
    role: raw.role,
    isActive: raw.isActive,
    hasLoginAccess: Boolean(raw.authUserId),
    assignedLeadCount: raw._count.assignedLeads,
    createdAt: raw.createdAt,
  };
}

function generateTemporaryPassword(): string {
  return `${randomBytes(12).toString("base64url")}Aa1!`;
}

async function assertNotLastActiveAdmin(userId: string): Promise<void> {
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true },
  });

  if (!target) {
    throw new PersonNotFoundError();
  }

  if (target.role !== UserRole.ADMIN || !target.isActive) {
    return;
  }

  const activeAdminCount = await prisma.user.count({
    where: { role: UserRole.ADMIN, isActive: true },
  });

  if (activeAdminCount <= 1) {
    throw new LastAdminError();
  }
}

export async function listPeople(): Promise<PersonListItem[]> {
  const people = await prisma.user.findMany({
    select: personSelect,
    orderBy: [{ isActive: "desc" }, { fullName: "asc" }],
  });

  return people.map(toPersonListItem);
}

export type CreatePersonInput = {
  fullName: string;
  email: string;
  role: UserRole;
};

export type CreatePersonOutput = {
  person: PersonListItem;
  temporaryPassword: string;
};

export async function createPerson(
  input: CreatePersonInput,
): Promise<CreatePersonOutput> {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing) {
    throw new PersonAlreadyExistsError();
  }

  const temporaryPassword = generateTemporaryPassword();
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName,
    },
  });

  if (error || !data.user) {
    throw new SupabaseAdminError(
      error?.message ?? "Unable to create the login account.",
    );
  }

  try {
    const created = await prisma.user.create({
      data: {
        authUserId: data.user.id,
        fullName: input.fullName,
        email: normalizedEmail,
        role: input.role,
      },
      select: personSelect,
    });

    return {
      person: toPersonListItem(created),
      temporaryPassword,
    };
  } catch (dbError) {
    await admin.auth.admin.deleteUser(data.user.id).catch((cleanupError) => {
      console.error(
        "Failed to roll back orphaned Supabase auth user",
        cleanupError,
      );
    });

    throw dbError;
  }
}

export async function setPersonRole(
  personId: string,
  role: UserRole,
): Promise<PersonListItem> {
  if (role !== UserRole.ADMIN) {
    await assertNotLastActiveAdmin(personId);
  }

  const updated = await prisma.user.update({
    where: { id: personId },
    data: { role },
    select: personSelect,
  });

  return toPersonListItem(updated);
}

async function setAuthUserBanStatus(
  authUserId: string | null,
  banned: boolean,
): Promise<void> {
  if (!authUserId) {
    return;
  }

  const admin = createAdminClient();

  const { error } = await admin.auth.admin.updateUserById(authUserId, {
    ban_duration: banned ? "876000h" : "none",
  });

  if (error) {
    console.error("Failed to update Supabase auth ban status", error);
  }
}

export async function setPersonActive(
  personId: string,
  isActive: boolean,
): Promise<PersonListItem> {
  if (!isActive) {
    await assertNotLastActiveAdmin(personId);
  }

  const updated = await prisma.user.update({
    where: { id: personId },
    data: { isActive },
    select: personSelect,
  });

  await setAuthUserBanStatus(updated.authUserId, !isActive);

  return toPersonListItem(updated);
}
