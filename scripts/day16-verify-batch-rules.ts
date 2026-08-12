/*
 * Day 16 verification script — "test and break intentionally" for the
 * batch/enrollment rules, run directly against the real dev database.
 *
 * Why this exists as a standalone script instead of importing the actual
 * service files (src/services/enrollment-service.ts, batch-service.ts):
 * those files import the real "server-only" package, which throws
 * unconditionally outside Next's server bundler — there is no flag that
 * makes plain Node/tsx accept it (Next resolves the "react-server"
 * export condition itself; a bare `node --conditions=react-server` does
 * not, because tsx's CJS loader doesn't route through it). So the
 * transaction logic below is a deliberate line-for-line copy of what
 * enrollLead() actually does, run against the same PostgreSQL database
 * and the same schema constraints (the @unique on Enrollment.leadId,
 * Serializable isolation). It proves the database-level guarantees;
 * the actual request path in production is still enroll-lead.ts ->
 * enrollment-service.ts, unmodified by this script.
 *
 * This script creates its own throwaway Course/Batch/Lead rows (all
 * titled "Day16 QA ...") and deletes everything it created in a
 * `finally` block, including a pre-run sweep in case a previous crashed
 * run left rows behind.
 *
 * Run with: npx tsx scripts/day16-verify-batch-rules.ts
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  BatchStatus,
  CourseStatus,
  EnrollmentStatus,
  LeadSource,
  LeadStatus,
  Prisma,
  PrismaClient,
  UserRole,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const QA_PREFIX = "Day16 QA";

let passed = 0;
let failed = 0;

function report(scenario: string, ok: boolean, detail: string) {
  const icon = ok ? "PASS" : "FAIL";
  console.log(`[${icon}] ${scenario} — ${detail}`);
  if (ok) {
    passed += 1;
  } else {
    failed += 1;
  }
}

/*
 * Verbatim copy of enrollLead()'s logic from
 * src/services/enrollment-service.ts, including the BATCH_ENDED
 * end-of-day boundary check added today.
 */
type EnrollErrorCode =
  | "LEAD_NOT_FOUND"
  | "ALREADY_ENROLLED"
  | "BATCH_NOT_FOUND"
  | "BATCH_UNAVAILABLE"
  | "BATCH_ENDED"
  | "BATCH_FULL";

class EnrollError extends Error {
  code: EnrollErrorCode;
  constructor(code: EnrollErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

async function enrollLead(leadId: string, batchId: string) {
  return prisma.$transaction(
    async (tx) => {
      const lead = await tx.lead.findFirst({
        where: { id: leadId, archivedAt: null },
        select: { id: true, status: true, enrollment: { select: { id: true } } },
      });

      if (!lead) {
        throw new EnrollError("LEAD_NOT_FOUND", "Lead not found.");
      }

      if (lead.enrollment || lead.status === LeadStatus.ENROLLED) {
        throw new EnrollError("ALREADY_ENROLLED", "This lead already has an enrollment.");
      }

      const batch = await tx.batch.findUnique({
        where: { id: batchId },
        select: { id: true, courseId: true, capacity: true, status: true, endDate: true },
      });

      if (!batch) {
        throw new EnrollError("BATCH_NOT_FOUND", "Batch not found.");
      }

      const acceptsEnrollments =
        batch.status === BatchStatus.UPCOMING || batch.status === BatchStatus.ONGOING;

      if (!acceptsEnrollments) {
        throw new EnrollError("BATCH_UNAVAILABLE", "Batch is not accepting enrollments.");
      }

      const endOfBatchDay = new Date(
        Date.UTC(
          batch.endDate.getUTCFullYear(),
          batch.endDate.getUTCMonth(),
          batch.endDate.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      );

      if (endOfBatchDay < new Date()) {
        throw new EnrollError("BATCH_ENDED", "Batch has already ended.");
      }

      const enrolledCount = await tx.enrollment.count({
        where: { batchId: batch.id, status: { not: EnrollmentStatus.CANCELLED } },
      });

      if (enrolledCount >= batch.capacity) {
        throw new EnrollError("BATCH_FULL", "Batch has reached capacity.");
      }

      const enrollment = await tx.enrollment.create({
        data: { leadId: lead.id, batchId: batch.id, status: EnrollmentStatus.ACTIVE },
        select: { id: true },
      });

      await tx.lead.update({
        where: { id: lead.id },
        data: { status: LeadStatus.ENROLLED, interestedCourseId: batch.courseId, nextFollowUpAt: null },
      });

      return enrollment;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

function daysFromToday(offset: number): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}

async function sweepLeftoverQaData() {
  const leftoverLeads = await prisma.lead.findMany({
    where: { fullName: { startsWith: QA_PREFIX } },
    select: { id: true },
  });
  const leadIds = leftoverLeads.map((lead) => lead.id);

  if (leadIds.length > 0) {
    await prisma.enrollment.deleteMany({ where: { leadId: { in: leadIds } } });
    await prisma.leadActivity.deleteMany({ where: { leadId: { in: leadIds } } });
    await prisma.lead.deleteMany({ where: { id: { in: leadIds } } });
  }

  await prisma.batch.deleteMany({ where: { title: { startsWith: QA_PREFIX } } });
  await prisma.course.deleteMany({ where: { title: { startsWith: QA_PREFIX } } });
}

async function main() {
  console.log("Sweeping any leftover Day16 QA data from a previous run...");
  await sweepLeftoverQaData();

  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, isActive: true },
    select: { id: true },
  });

  if (!admin) {
    throw new Error(
      "No active ADMIN user found in this database — cannot run the verification script.",
    );
  }

  const adminId = admin.id;

  const course = await prisma.course.create({
    data: { title: `${QA_PREFIX} Course`, duration: "1 week", status: CourseStatus.ACTIVE },
    select: { id: true },
  });

  async function createQaBatch(opts: {
    title: string;
    capacity: number;
    status: (typeof BatchStatus)[keyof typeof BatchStatus];
    startDate: Date;
    endDate: Date;
  }) {
    return prisma.batch.create({
      data: {
        courseId: course.id,
        title: `${QA_PREFIX} ${opts.title}`,
        capacity: opts.capacity,
        startDate: opts.startDate,
        endDate: opts.endDate,
        status: opts.status,
      },
      select: { id: true, capacity: true, status: true },
    });
  }

  let leadCounter = 0;
  async function createQaLead(): Promise<string> {
    leadCounter += 1;
    const lead = await prisma.lead.create({
      data: {
        fullName: `${QA_PREFIX} Lead ${leadCounter}`,
        phone: `+9779${String(800000000 + leadCounter).padStart(9, "0")}`,
        interestedCourseId: course.id,
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
        assignedCounselorId: adminId,
      },
      select: { id: true },
    });
    return lead.id;
  }

  try {
    // --- Scenario 1: capacity exactly reached ---
    const capacityOneBatch = await createQaBatch({
      title: "Capacity-One Batch",
      capacity: 1,
      status: BatchStatus.UPCOMING,
      startDate: daysFromToday(7),
      endDate: daysFromToday(14),
    });

    const firstLead = await createQaLead();
    const secondLead = await createQaLead();

    await enrollLead(firstLead, capacityOneBatch.id);
    const finalCount = await prisma.enrollment.count({
      where: { batchId: capacityOneBatch.id, status: { not: EnrollmentStatus.CANCELLED } },
    });
    report(
      "Capacity exactly reached — first enrollment",
      finalCount === 1,
      `enrolled count after first enrollment = ${finalCount} (expected 1)`,
    );

    try {
      await enrollLead(secondLead, capacityOneBatch.id);
      report("Capacity exactly reached — second enrollment blocked", false, "second enrollment unexpectedly succeeded");
    } catch (error) {
      const code = error instanceof EnrollError ? error.code : "UNKNOWN";
      report(
        "Capacity exactly reached — second enrollment blocked",
        code === "BATCH_FULL",
        `rejected with code ${code} (expected BATCH_FULL)`,
      );
    }

    // --- Scenario 2: cancelled (inactive) batch ---
    const cancelledBatch = await createQaBatch({
      title: "Cancelled Batch",
      capacity: 5,
      status: BatchStatus.CANCELLED,
      startDate: daysFromToday(7),
      endDate: daysFromToday(14),
    });
    const cancelledLead = await createQaLead();

    try {
      await enrollLead(cancelledLead, cancelledBatch.id);
      report("Cancelled batch rejects enrollment", false, "enrollment unexpectedly succeeded");
    } catch (error) {
      const code = error instanceof EnrollError ? error.code : "UNKNOWN";
      report(
        "Cancelled batch rejects enrollment",
        code === "BATCH_UNAVAILABLE",
        `rejected with code ${code} (expected BATCH_UNAVAILABLE)`,
      );
    }

    // --- Scenario 3: past batch (status stale, dates already ended) ---
    const pastBatch = await createQaBatch({
      title: "Past Batch",
      capacity: 5,
      status: BatchStatus.UPCOMING, // deliberately stale: an admin never marked it COMPLETED
      startDate: daysFromToday(-30),
      endDate: daysFromToday(-20),
    });
    const pastLead = await createQaLead();

    try {
      await enrollLead(pastLead, pastBatch.id);
      report("Past batch rejects enrollment despite stale status", false, "enrollment unexpectedly succeeded");
    } catch (error) {
      const code = error instanceof EnrollError ? error.code : "UNKNOWN";
      report(
        "Past batch rejects enrollment despite stale status",
        code === "BATCH_ENDED",
        `rejected with code ${code} (expected BATCH_ENDED)`,
      );
    }

    // --- Scenario 4: lead enrolled twice ---
    const doubleEnrollBatch = await createQaBatch({
      title: "Double Enroll Batch",
      capacity: 5,
      status: BatchStatus.UPCOMING,
      startDate: daysFromToday(7),
      endDate: daysFromToday(14),
    });
    const doubleEnrollLead = await createQaLead();

    await enrollLead(doubleEnrollLead, doubleEnrollBatch.id);
    try {
      await enrollLead(doubleEnrollLead, doubleEnrollBatch.id);
      report("Lead cannot be enrolled twice", false, "second enrollment unexpectedly succeeded");
    } catch (error) {
      const code = error instanceof EnrollError ? error.code : "UNKNOWN";
      report(
        "Lead cannot be enrolled twice",
        code === "ALREADY_ENROLLED",
        `rejected with code ${code} (expected ALREADY_ENROLLED)`,
      );
    }

    // Also prove the database itself blocks it, independent of the
    // application check, by trying to insert a second Enrollment row
    // directly against the unique constraint on leadId.
    try {
      await prisma.enrollment.create({
        data: { leadId: doubleEnrollLead, batchId: doubleEnrollBatch.id, status: EnrollmentStatus.ACTIVE },
      });
      report("Database unique constraint blocks duplicate enrollment", false, "raw insert unexpectedly succeeded");
    } catch (error) {
      const isUniqueViolation =
        typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "P2002";
      report(
        "Database unique constraint blocks duplicate enrollment",
        isUniqueViolation,
        isUniqueViolation ? "rejected with P2002 (unique constraint)" : `rejected with unexpected error: ${error}`,
      );
    }

    // --- Scenario 5: concurrent enrollment race for the last seat ---
    const raceBatch = await createQaBatch({
      title: "Race Batch",
      capacity: 1,
      status: BatchStatus.UPCOMING,
      startDate: daysFromToday(7),
      endDate: daysFromToday(14),
    });
    const raceLeadA = await createQaLead();
    const raceLeadB = await createQaLead();

    const raceResults = await Promise.allSettled([
      enrollLead(raceLeadA, raceBatch.id),
      enrollLead(raceLeadB, raceBatch.id),
    ]);

    const succeeded = raceResults.filter((result) => result.status === "fulfilled").length;
    const finalRaceCount = await prisma.enrollment.count({
      where: { batchId: raceBatch.id, status: { not: EnrollmentStatus.CANCELLED } },
    });

    report(
      "Concurrent enrollment never overbooks a 1-seat batch",
      succeeded === 1 && finalRaceCount === 1,
      `${succeeded}/2 concurrent attempts succeeded, final enrolled count = ${finalRaceCount} (expected 1 and 1)`,
    );
  } finally {
    console.log("\nCleaning up Day16 QA data...");
    await sweepLeftoverQaData();
    await prisma.$disconnect();
  }

  console.log(`\n${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch(async (error) => {
  console.error("Verification script crashed:", error);
  await sweepLeftoverQaData().catch(() => {});
  await prisma.$disconnect();
  process.exitCode = 1;
});
