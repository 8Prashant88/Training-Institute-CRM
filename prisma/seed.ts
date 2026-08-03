import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  BatchStatus,
  EnrollmentStatus,
  LeadSource,
  LeadStatus,
  PrismaClient,
  UserRole,
} from "../src/generated/prisma/client";

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is not configured.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

const ids = {
  aiBatch: "00000000-0000-4000-8000-000000000201",
  fullStackBatch: "00000000-0000-4000-8000-000000000202",

  newLead: "00000000-0000-4000-8000-000000000301",
  followUpLead: "00000000-0000-4000-8000-000000000302",
  enrolledLead: "00000000-0000-4000-8000-000000000303",

  firstNote: "00000000-0000-4000-8000-000000000401",
  secondNote: "00000000-0000-4000-8000-000000000402",

  enrollment: "00000000-0000-4000-8000-000000000501",
};

async function main() {
  console.log("Starting database seed...");

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@saarathiacademy.com.np",
    },
    update: {
      fullName: "CRM Administrator",
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      fullName: "CRM Administrator",
      email: "admin@saarathiacademy.com.np",
      role: UserRole.ADMIN,
    },
  });

  const counselor = await prisma.user.upsert({
    where: {
      email: "counselor@saarathiacademy.com.np",
    },
    update: {
      fullName: "Demo Counselor",
      role: UserRole.COUNSELOR,
      isActive: true,
    },
    create: {
      fullName: "Demo Counselor",
      email: "counselor@saarathiacademy.com.np",
      role: UserRole.COUNSELOR,
    },
  });

  const aiCourse = await prisma.course.upsert({
    where: {
      title: "AI Engineering",
    },
    update: {
      duration: "12 weeks",
    },
    create: {
      title: "AI Engineering",
      duration: "12 weeks",
    },
  });

  const fullStackCourse = await prisma.course.upsert({
    where: {
      title: "Full Stack Development",
    },
    update: {
      duration: "16 weeks",
    },
    create: {
      title: "Full Stack Development",
      duration: "16 weeks",
    },
  });

  const aiBatch = await prisma.batch.upsert({
    where: {
      id: ids.aiBatch,
    },
    update: {
      courseId: aiCourse.id,
      title: "AI Engineering — September Morning",
      capacity: 10,
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2026-11-30T00:00:00.000Z"),
      status: BatchStatus.UPCOMING,
    },
    create: {
      id: ids.aiBatch,
      courseId: aiCourse.id,
      title: "AI Engineering — September Morning",
      capacity: 10,
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2026-11-30T00:00:00.000Z"),
      status: BatchStatus.UPCOMING,
    },
  });

  const fullStackBatch = await prisma.batch.upsert({
    where: {
      id: ids.fullStackBatch,
    },
    update: {
      courseId: fullStackCourse.id,
      title: "Full Stack — August Evening",
      capacity: 15,
      startDate: new Date("2026-08-10T00:00:00.000Z"),
      endDate: new Date("2026-12-10T00:00:00.000Z"),
      status: BatchStatus.ONGOING,
    },
    create: {
      id: ids.fullStackBatch,
      courseId: fullStackCourse.id,
      title: "Full Stack — August Evening",
      capacity: 15,
      startDate: new Date("2026-08-10T00:00:00.000Z"),
      endDate: new Date("2026-12-10T00:00:00.000Z"),
      status: BatchStatus.ONGOING,
    },
  });

  const newLead = await prisma.lead.upsert({
    where: {
      id: ids.newLead,
    },
    update: {
      fullName: "Aarav Sharma",
      phone: "+9779811111111",
      email: "aarav@example.com",
      interestedCourseId: aiCourse.id,
      source: LeadSource.WEBSITE,
      status: LeadStatus.NEW,
      assignedCounselorId: null,
      nextFollowUpAt: null,
      archivedAt: null,
    },
    create: {
      id: ids.newLead,
      fullName: "Aarav Sharma",
      phone: "+9779811111111",
      email: "aarav@example.com",
      interestedCourseId: aiCourse.id,
      source: LeadSource.WEBSITE,
      status: LeadStatus.NEW,
    },
  });

  const followUpLead = await prisma.lead.upsert({
    where: {
      id: ids.followUpLead,
    },
    update: {
      fullName: "Nisha Karki",
      phone: "+9779822222222",
      email: "nisha@example.com",
      interestedCourseId: fullStackCourse.id,
      source: LeadSource.REFERRAL,
      status: LeadStatus.FOLLOW_UP,
      assignedCounselorId: counselor.id,
      nextFollowUpAt: new Date("2026-08-05T04:15:00.000Z"),
      archivedAt: null,
    },
    create: {
      id: ids.followUpLead,
      fullName: "Nisha Karki",
      phone: "+9779822222222",
      email: "nisha@example.com",
      interestedCourseId: fullStackCourse.id,
      source: LeadSource.REFERRAL,
      status: LeadStatus.FOLLOW_UP,
      assignedCounselorId: counselor.id,
      nextFollowUpAt: new Date("2026-08-05T04:15:00.000Z"),
    },
  });

  const enrolledLead = await prisma.lead.upsert({
    where: {
      id: ids.enrolledLead,
    },
    update: {
      fullName: "Suman Thapa",
      phone: "+9779833333333",
      email: "suman@example.com",
      interestedCourseId: fullStackCourse.id,
      source: LeadSource.WALK_IN,
      status: LeadStatus.ENROLLED,
      assignedCounselorId: counselor.id,
      nextFollowUpAt: null,
      archivedAt: null,
    },
    create: {
      id: ids.enrolledLead,
      fullName: "Suman Thapa",
      phone: "+9779833333333",
      email: "suman@example.com",
      interestedCourseId: fullStackCourse.id,
      source: LeadSource.WALK_IN,
      status: LeadStatus.ENROLLED,
      assignedCounselorId: counselor.id,
    },
  });

  await prisma.leadNote.upsert({
    where: {
      id: ids.firstNote,
    },
    update: {
      leadId: followUpLead.id,
      authorId: counselor.id,
      note: "Student requested a follow-up call after reviewing the syllabus.",
    },
    create: {
      id: ids.firstNote,
      leadId: followUpLead.id,
      authorId: counselor.id,
      note: "Student requested a follow-up call after reviewing the syllabus.",
    },
  });

  await prisma.leadNote.upsert({
    where: {
      id: ids.secondNote,
    },
    update: {
      leadId: enrolledLead.id,
      authorId: admin.id,
      note: "Admission confirmed and enrollment completed.",
    },
    create: {
      id: ids.secondNote,
      leadId: enrolledLead.id,
      authorId: admin.id,
      note: "Admission confirmed and enrollment completed.",
    },
  });

  await prisma.enrollment.upsert({
    where: {
      leadId: enrolledLead.id,
    },
    update: {
      batchId: fullStackBatch.id,
      status: EnrollmentStatus.ACTIVE,
    },
    create: {
      id: ids.enrollment,
      leadId: enrolledLead.id,
      batchId: fullStackBatch.id,
      status: EnrollmentStatus.ACTIVE,
    },
  });

  console.log("Database seed completed.");
  console.log({
    users: 2,
    courses: 2,
    batches: 2,
    leads: 3,
    notes: 2,
    enrollments: 1,
    unassignedLead: newLead.fullName,
    upcomingBatch: aiBatch.title,
  });
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });