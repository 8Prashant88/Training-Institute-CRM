/*
 * Central definition of which lead status moves are allowed, and what
 * extra input (a note, a follow-up date, or both) each move requires.
 *
 * No "server-only" import here on purpose: this module is imported by
 * both server actions/services AND client components (the status-change
 * dialog needs it for immediate UI feedback), so it must stay safe to
 * bundle into the browser. Import enum values from "@/generated/prisma/enums"
 * (browser-safe), never from "@/generated/prisma/client" (Node-only).
 */
import { LeadStatus as DatabaseLeadStatus } from "@/generated/prisma/enums";

export type LeadStatusTransitionRequirement =
  | "ALLOWED"
  | "REQUIRES_NOTE"
  | "REQUIRES_FOLLOW_UP_DATE"
  | "REQUIRES_NOTE_AND_FOLLOW_UP_DATE"
  | "BLOCKED";

/*
 * Statuses a person can manually set. ENROLLED is deliberately excluded —
 * it is only reachable through the enrollment transaction.
 */
export const manuallyEditableLeadStatusValues = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "LOST",
] as const;

/*
 * Statuses that never need a note or a follow-up date to move into.
 * Used to narrow bulk status-change, which cannot collect extra input
 * per lead.
 */
export const bulkEligibleLeadStatusValues = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
] as const;

/*
 * from -> to -> requirement. Any pair not listed here is BLOCKED.
 *
 * - NEW/CONTACTED/INTERESTED/FOLLOW_UP move freely between each other
 *   (forward, sideways, or backward) with no extra input.
 * - Moving any active status to FOLLOW_UP requires a follow-up date.
 * - Moving any active status to LOST is always allowed.
 * - ENROLLED cannot be entered or left manually at all.
 * - Reactivating a LOST lead always requires a note explaining why;
 *   reactivating straight into FOLLOW_UP requires both a note and a date.
 */
export const LEAD_STATUS_TRANSITION_RULES: Record<
  DatabaseLeadStatus,
  Partial<Record<DatabaseLeadStatus, LeadStatusTransitionRequirement>>
> = {
  NEW: {
    CONTACTED: "ALLOWED",
    INTERESTED: "ALLOWED",
    FOLLOW_UP: "REQUIRES_FOLLOW_UP_DATE",
    LOST: "ALLOWED",
  },
  CONTACTED: {
    NEW: "ALLOWED",
    INTERESTED: "ALLOWED",
    FOLLOW_UP: "REQUIRES_FOLLOW_UP_DATE",
    LOST: "ALLOWED",
  },
  INTERESTED: {
    NEW: "ALLOWED",
    CONTACTED: "ALLOWED",
    FOLLOW_UP: "REQUIRES_FOLLOW_UP_DATE",
    LOST: "ALLOWED",
  },
  FOLLOW_UP: {
    NEW: "ALLOWED",
    CONTACTED: "ALLOWED",
    INTERESTED: "ALLOWED",
    LOST: "ALLOWED",
  },
  ENROLLED: {},
  LOST: {
    NEW: "REQUIRES_NOTE",
    CONTACTED: "REQUIRES_NOTE",
    INTERESTED: "REQUIRES_NOTE",
    FOLLOW_UP: "REQUIRES_NOTE_AND_FOLLOW_UP_DATE",
  },
};

export function getLeadStatusTransitionRequirement(
  from: DatabaseLeadStatus,
  to: DatabaseLeadStatus,
): LeadStatusTransitionRequirement {
  if (from === to) {
    return "BLOCKED";
  }

  return LEAD_STATUS_TRANSITION_RULES[from]?.[to] ?? "BLOCKED";
}

export function requiresNote(
  requirement: LeadStatusTransitionRequirement,
): boolean {
  return (
    requirement === "REQUIRES_NOTE" ||
    requirement === "REQUIRES_NOTE_AND_FOLLOW_UP_DATE"
  );
}

export function requiresFollowUpDate(
  requirement: LeadStatusTransitionRequirement,
): boolean {
  return (
    requirement === "REQUIRES_FOLLOW_UP_DATE" ||
    requirement === "REQUIRES_NOTE_AND_FOLLOW_UP_DATE"
  );
}

/*
 * "On or after today" compares UTC calendar day, not exact instant.
 * This project has no per-user timezone concept, so UTC-day boundaries
 * are the simplest rule that stays consistent between this validation
 * and the Today/Overdue follow-up query (lead-followups-service.ts).
 */
export function isFollowUpDateOnOrAfterToday(
  date: Date,
  now: Date = new Date(),
): boolean {
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  const candidateDay = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );

  return candidateDay >= today;
}

/**
 * Midnight UTC on `now`'s calendar day — the shared boundary for every
 * "is this due today / overdue" comparison in the app (follow-up date
 * validation here, the Today/Overdue split in lead-followups-service.ts,
 * and the overdue badge shown on lead lists/cards).
 */
export function startOfUtcDay(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/**
 * A lead only counts as overdue while it's still sitting in FOLLOW_UP —
 * once it moves to any other status the scheduled date is history, not
 * an open commitment.
 */
export function isFollowUpOverdue(
  status: string,
  nextFollowUpAt: string | Date | null,
  now: Date = new Date(),
): boolean {
  if (status !== "FOLLOW_UP" || !nextFollowUpAt) {
    return false;
  }

  const date =
    typeof nextFollowUpAt === "string"
      ? new Date(nextFollowUpAt)
      : nextFollowUpAt;

  return date < startOfUtcDay(now);
}
