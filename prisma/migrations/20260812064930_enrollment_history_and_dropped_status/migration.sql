-- AlterEnum
ALTER TYPE "EnrollmentStatus" ADD VALUE 'DROPPED';

-- DropIndex
DROP INDEX "Enrollment_leadId_key";

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "dropReason" TEXT,
ADD COLUMN     "droppedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Enrollment_leadId_idx" ON "Enrollment"("leadId");

-- CreateIndex
-- Hand-written: Prisma's schema language has no way to express a partial
-- (filtered) unique index, so this constraint exists only here, not as
-- a `@@unique` in schema.prisma. It replaces the plain uniqueness this
-- migration just dropped from Enrollment.leadId: a lead may now have
-- many Enrollment rows over time (drop-and-re-enroll, a second course
-- after completing the first), but the database still guarantees at
-- most one of them can be ACTIVE at once, even under concurrent writes.
-- Every existing Enrollment row already satisfies this (the old plain
-- unique constraint guaranteed at most one row per lead, active or not),
-- so this index can be created with no data changes.
CREATE UNIQUE INDEX "Enrollment_one_active_per_lead_key" ON "Enrollment"("leadId") WHERE "status" = 'ACTIVE';
