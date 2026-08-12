/*
 * Central definition of which batch status moves are allowed.
 *
 * No "server-only" import here on purpose: this module is imported by
 * both batch-service AND the admin batch-management UI (so buttons can
 * only ever offer a valid next status), so it must stay safe to bundle
 * into the browser. Import enum values from "@/generated/prisma/enums"
 * (browser-safe), never from "@/generated/prisma/client" (Node-only).
 */
import { BatchStatus as DatabaseBatchStatus } from "@/generated/prisma/enums";

/*
 * UPCOMING -> ONGOING -> COMPLETED is the normal lifecycle.
 * CANCELLED can be reached from UPCOMING or ONGOING, but never left —
 * a cancelled batch is a permanent record, not a state to recover from.
 * COMPLETED is likewise permanent. Both are dead ends on purpose: this
 * project has no "reopen a batch" workflow, and forcing a new batch to
 * be created instead keeps enrollment history unambiguous.
 */
export const BATCH_STATUS_TRANSITION_RULES: Record<
  DatabaseBatchStatus,
  DatabaseBatchStatus[]
> = {
  UPCOMING: [DatabaseBatchStatus.ONGOING, DatabaseBatchStatus.CANCELLED],
  ONGOING: [DatabaseBatchStatus.COMPLETED, DatabaseBatchStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

export function getAllowedNextBatchStatuses(
  currentStatus: DatabaseBatchStatus,
): DatabaseBatchStatus[] {
  return BATCH_STATUS_TRANSITION_RULES[currentStatus];
}

export function isBatchStatusTransitionAllowed(
  from: DatabaseBatchStatus,
  to: DatabaseBatchStatus,
): boolean {
  if (from === to) {
    return false;
  }

  return BATCH_STATUS_TRANSITION_RULES[from].includes(to);
}

/*
 * A batch is "locked" once it is COMPLETED or CANCELLED: its capacity,
 * title, and dates become a historical record rather than something an
 * admin can keep editing.
 */
export function isBatchLocked(status: DatabaseBatchStatus): boolean {
  return (
    status === DatabaseBatchStatus.COMPLETED ||
    status === DatabaseBatchStatus.CANCELLED
  );
}

export const batchStatusLabels: Record<DatabaseBatchStatus, string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
