import "server-only";

import { Prisma } from "@/generated/prisma/client";

import { requireAdmin } from "@/lib/authorization";

import { prisma } from "@/lib/prisma";

import type { AuthenticatedCrmUser } from "@/services/user-service";

export type TagOption = {
  id: string;
  name: string;
};

export type TagServiceErrorCode = "DUPLICATE_NAME" | "NOT_FOUND";

export class TagServiceError extends Error {
  readonly code: TagServiceErrorCode;

  constructor(code: TagServiceErrorCode, message: string) {
    super(message);

    this.name = "TagServiceError";
    this.code = code;
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function isRecordNotFoundError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

/**
 * Read-only reference data — every authenticated user can see the full
 * tag catalog (needed to filter/attach tags), even though only an
 * admin can create, rename, or delete a tag.
 */
export async function listTags(): Promise<TagOption[]> {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createTag(
  name: string,
  actor: AuthenticatedCrmUser,
): Promise<TagOption> {
  requireAdmin(actor);

  try {
    return await prisma.tag.create({
      data: { name: name.trim() },
      select: { id: true, name: true },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new TagServiceError(
        "DUPLICATE_NAME",
        "A tag with this name already exists.",
      );
    }

    throw error;
  }
}

export async function renameTag(
  id: string,
  name: string,
  actor: AuthenticatedCrmUser,
): Promise<TagOption> {
  requireAdmin(actor);

  try {
    return await prisma.tag.update({
      where: { id },
      data: { name: name.trim() },
      select: { id: true, name: true },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new TagServiceError(
        "DUPLICATE_NAME",
        "A tag with this name already exists.",
      );
    }

    if (isRecordNotFoundError(error)) {
      throw new TagServiceError("NOT_FOUND", "The tag was not found.");
    }

    throw error;
  }
}

export async function deleteTag(
  id: string,
  actor: AuthenticatedCrmUser,
): Promise<void> {
  requireAdmin(actor);

  try {
    await prisma.tag.delete({ where: { id } });
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      throw new TagServiceError("NOT_FOUND", "The tag was not found.");
    }

    throw error;
  }
}
