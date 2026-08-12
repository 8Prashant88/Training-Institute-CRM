/*
 * Verifies two things Day 17 explicitly calls for as "definition of
 * done": CSV export handles special characters safely (RFC 4180
 * quoting, formula-injection guarding, no data loss), and dashboard
 * metrics match manually verified database counts — not just "the
 * query runs," but "the number it returns is the number it should be."
 *
 * The CSV checks import src/lib/csv.ts directly (no "server-only"
 * guard on that file — it's a pure formatting module, not a database
 * one). The dashboard checks can't import dashboard-service.ts itself
 * for the same reason explained in verify-batch-enrollment-rules.ts
 * (the real "server-only" package throws outside Next's bundler), so
 * they run the same aggregation queries directly against the dev
 * database and compare the result against counts computed by hand
 * from data this script creates and controls.
 *
 * Run with: npx tsx scripts/verify-dashboard-metrics.ts
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  CourseStatus,
  EnrollmentStatus,
  LeadSource,
  LeadStatus,
  PrismaClient,
  UserRole,
} from "../src/generated/prisma/client";

import { escapeCsvField, toCsv } from "../src/lib/csv";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const QA_PREFIX = "QA Dashboard";

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

function daysFromToday(offset: number): Date {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0); // noon UTC: safely inside any calendar day
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}

// --- CSV escaping checks (pure functions, no database) ---

function verifyCsvEscaping() {
  report(
    "Plain field is left unquoted",
    escapeCsvField("Simple Name") === "Simple Name",
    `got ${JSON.stringify(escapeCsvField("Simple Name"))}`,
  );

  const commaField = escapeCsvField("Kathmandu, Nepal");
  report(
    "Field with a comma is quoted",
    commaField === '"Kathmandu, Nepal"',
    `got ${JSON.stringify(commaField)}`,
  );

  const quoteField = escapeCsvField('She said "hello"');
  report(
    "Internal quotes are doubled and the field is wrapped",
    quoteField === '"She said ""hello"""',
    `got ${JSON.stringify(quoteField)}`,
  );

  const newlineField = escapeCsvField("Line one\nLine two");
  report(
    "Field with a newline is quoted",
    newlineField === '"Line one\nLine two"',
    `got ${JSON.stringify(newlineField)}`,
  );

  const formulaField = escapeCsvField("=cmd|' /C calc'!A0");
  report(
    "A field that looks like a formula is neutralized",
    formulaField.startsWith("'="),
    `got ${JSON.stringify(formulaField)}`,
  );

  const csv = toCsv(
    ["Name", "Note"],
    [["Ram, Sharma", 'Said "yes", enrolling\nnext week']],
  );
  const roundTrips =
    csv.includes('"Ram, Sharma"') && csv.includes('""yes""');
  report(
    "toCsv() produces a well-formed row for a realistic mixed field",
    roundTrips,
    roundTrips ? "quoting and escaping both applied correctly" : csv,
  );
}

// --- Dashboard aggregation checks (real database, known QA data) ---

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

async function verifyDashboardAggregation() {
  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN, isActive: true },
    select: { id: true },
  });

  if (!admin) {
    throw new Error("No active ADMIN user found — cannot run dashboard checks.");
  }

  const adminId = admin.id;

  const course = await prisma.course.create({
    data: { title: `${QA_PREFIX} Course`, duration: "1 week", status: CourseStatus.ACTIVE },
    select: { id: true },
  });

  const batch = await prisma.batch.create({
    data: {
      courseId: course.id,
      title: `${QA_PREFIX} Batch`,
      capacity: 50,
      startDate: daysFromToday(7),
      endDate: daysFromToday(14),
      status: "UPCOMING",
    },
    select: { id: true },
  });

  let counter = 0;
  async function createQaLead(opts: {
    status: (typeof LeadStatus)[keyof typeof LeadStatus];
    source: (typeof LeadSource)[keyof typeof LeadSource];
    createdAt: Date;
  }) {
    counter += 1;
    return prisma.lead.create({
      data: {
        fullName: `${QA_PREFIX} Lead ${counter}`,
        phone: `+9779${String(810000000 + counter).padStart(9, "0")}`,
        interestedCourseId: course.id,
        source: opts.source,
        status: opts.status,
        assignedCounselorId: adminId,
        createdAt: opts.createdAt,
      },
      select: { id: true },
    });
  }

  // Known, hand-computed data set:
  // - 2 leads created today (within the last week)
  // - 1 lead created 20 days ago (outside the last week)
  // - Sources: 2 WEBSITE, 1 REFERRAL
  // - 1 of the 3 is ENROLLED (the 20-day-old one)
  const recentLeadA = await createQaLead({
    status: LeadStatus.NEW,
    source: LeadSource.WEBSITE,
    createdAt: daysFromToday(0),
  });
  const recentLeadB = await createQaLead({
    status: LeadStatus.CONTACTED,
    source: LeadSource.WEBSITE,
    createdAt: daysFromToday(0),
  });
  const olderEnrolledLead = await createQaLead({
    status: LeadStatus.ENROLLED,
    source: LeadSource.REFERRAL,
    createdAt: daysFromToday(-20),
  });

  // Enrollment for the enrolled lead, backdated to last month, to
  // verify "enrollments this month" excludes it while "active
  // enrollments" still counts it (status is independent of the date).
  const now = new Date();
  const lastMonthDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15, 12, 0, 0),
  );

  await prisma.enrollment.create({
    data: {
      leadId: olderEnrolledLead.id,
      batchId: batch.id,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: lastMonthDate,
    },
  });

  // A second, separate enrolled lead+enrollment dated THIS month, to
  // verify "enrollments this month" correctly includes a current one.
  const thisMonthEnrolledLead = await createQaLead({
    status: LeadStatus.ENROLLED,
    source: LeadSource.WEBSITE,
    createdAt: daysFromToday(0),
  });

  await prisma.enrollment.create({
    data: {
      leadId: thisMonthEnrolledLead.id,
      batchId: batch.id,
      status: EnrollmentStatus.ACTIVE,
      enrolledAt: now,
    },
  });

  // --- Replicate dashboard-service.ts's queries, scoped to just this
  // QA course's leads so the assertions are exact regardless of
  // whatever else already exists in the dev database. ---
  const leadWhere = {
    archivedAt: null as null,
    interestedCourseId: course.id,
  };

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  const totalLeads = await prisma.lead.count({ where: leadWhere });
  report("Total leads matches hand count", totalLeads === 4, `got ${totalLeads}, expected 4`);

  const newThisWeek = await prisma.lead.count({
    where: { ...leadWhere, createdAt: { gte: oneWeekAgo } },
  });
  report(
    "New-this-week excludes the 20-day-old lead",
    newThisWeek === 3,
    `got ${newThisWeek}, expected 3 (4 total minus the 20-day-old one)`,
  );

  const enrolledCount = await prisma.lead.count({
    where: { ...leadWhere, status: LeadStatus.ENROLLED },
  });
  const conversionRate =
    totalLeads > 0 ? Math.round((enrolledCount / totalLeads) * 100) : 0;
  report(
    "Conversion rate matches hand calculation",
    enrolledCount === 2 && conversionRate === 50,
    `got ${enrolledCount}/${totalLeads} = ${conversionRate}%, expected 2/4 = 50%`,
  );

  const enrollmentsThisMonth = await prisma.enrollment.count({
    where: {
      enrolledAt: { gte: startOfMonth },
      lead: { interestedCourseId: course.id },
    },
  });
  report(
    "Enrollments-this-month excludes the backdated one",
    enrollmentsThisMonth === 1,
    `got ${enrollmentsThisMonth}, expected 1 (the last-month one must not count)`,
  );

  const activeEnrollments = await prisma.enrollment.count({
    where: {
      status: EnrollmentStatus.ACTIVE,
      lead: { interestedCourseId: course.id },
    },
  });
  report(
    "Active enrollments counts both regardless of enrolledAt date",
    activeEnrollments === 2,
    `got ${activeEnrollments}, expected 2 (both are ACTIVE right now)`,
  );

  const sourceGroups = await prisma.lead.groupBy({
    by: ["source"],
    where: leadWhere,
    _count: { _all: true },
  });
  const websiteCount =
    sourceGroups.find((g) => g.source === LeadSource.WEBSITE)?._count._all ?? 0;
  const referralCount =
    sourceGroups.find((g) => g.source === LeadSource.REFERRAL)?._count._all ?? 0;
  report(
    "Leads-by-source groups match hand count",
    websiteCount === 3 && referralCount === 1,
    `got WEBSITE=${websiteCount}, REFERRAL=${referralCount}, expected 3 and 1`,
  );

  void recentLeadA;
  void recentLeadB;
}

async function main() {
  console.log("Sweeping any leftover QA data from a previous run...");
  await sweepLeftoverQaData();

  verifyCsvEscaping();

  try {
    await verifyDashboardAggregation();
  } finally {
    console.log("\nCleaning up QA data...");
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
