-- DropIndex
DROP INDEX "Lead_email_trgm_idx";

-- DropIndex
DROP INDEX "Lead_fullName_trgm_idx";

-- DropIndex
DROP INDEX "Lead_phone_trgm_idx";

-- AlterTable
ALTER TABLE "_LeadToTag" ADD CONSTRAINT "_LeadToTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_LeadToTag_AB_unique";
