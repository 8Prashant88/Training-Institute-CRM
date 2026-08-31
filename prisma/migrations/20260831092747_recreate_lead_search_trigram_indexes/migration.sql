-- The original trigram indexes (add_lead_search_trigram_indexes) were
-- hand-written SQL with no corresponding `@@index` in schema.prisma —
-- `prisma migrate dev`'s drift reconciliation treated them as
-- unmanaged and dropped them in the very next migration
-- (leadsearch_and_priority_tags_enabled). schema.prisma now declares
-- these properly via `@@index(..., type: Gin)` with the
-- `postgresqlExtensions` preview feature, so this recreation will
-- actually stick.

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateIndex
CREATE INDEX "Lead_fullName_idx" ON "Lead" USING GIN ("fullName" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead" USING GIN ("email" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead" USING GIN ("phone" gin_trgm_ops);
