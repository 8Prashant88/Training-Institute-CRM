import "server-only";

import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import type { LeadListQuery } from "@/lib/lead-list-query";

export type SavedViewSummary = {
  id: string;
  name: string;
  query: Omit<LeadListQuery, "page" | "pageSize">;
};

export type SavedViewServiceErrorCode = "DUPLICATE_NAME" | "NOT_FOUND";

export class SavedViewServiceError extends Error {
  readonly code: SavedViewServiceErrorCode;

  constructor(code: SavedViewServiceErrorCode, message: string) {
    super(message);

    this.name = "SavedViewServiceError";
    this.code = code;
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function listSavedViews(
  ownerId: string,
): Promise<SavedViewSummary[]> {
  const views = await prisma.savedView.findMany({
    where: { ownerId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, query: true },
  });

  return views.map((view) => ({
    id: view.id,
    name: view.name,
    query: view.query as SavedViewSummary["query"],
  }));
}

export async function createSavedView(input: {
  ownerId: string;
  name: string;
  query: SavedViewSummary["query"];
}): Promise<SavedViewSummary> {
  try {
    const view = await prisma.savedView.create({
      data: {
        ownerId: input.ownerId,
        name: input.name,
        query: input.query as Prisma.InputJsonValue,
      },
      select: { id: true, name: true, query: true },
    });

    return {
      id: view.id,
      name: view.name,
      query: view.query as SavedViewSummary["query"],
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new SavedViewServiceError(
        "DUPLICATE_NAME",
        "You already have a saved view with this name.",
      );
    }

    throw error;
  }
}

export async function deleteSavedView(
  id: string,
  ownerId: string,
): Promise<void> {
  /*
   * `ownerId` in the where clause IS the authorization check here —
   * deleteMany matches zero rows (rather than throwing) for a view
   * that belongs to someone else or doesn't exist, so both cases are
   * indistinguishable from "not found" to the caller.
   */
  const result = await prisma.savedView.deleteMany({
    where: { id, ownerId },
  });

  if (result.count === 0) {
    throw new SavedViewServiceError(
      "NOT_FOUND",
      "The saved view was not found.",
    );
  }
}
