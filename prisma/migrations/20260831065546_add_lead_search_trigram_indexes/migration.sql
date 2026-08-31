-- Hand-written, like the partial unique index added in
-- enrollment_history_and_dropped_status: Prisma's schema language has
-- no way to express a GIN trigram index, so these exist only here, not
-- as `@@index` in schema.prisma.
--
-- lead-list-service.ts's search filter uses Prisma's `contains`
-- (translated to `ILIKE '%term%'`) against Lead.fullName / email /
-- phone. A leading wildcard means a normal B-tree index can never
-- support that query — Postgres falls back to a sequential scan. Fine
-- at this project's current lead volume, but it's the one real gap in
-- an otherwise well-indexed query path once the table grows past a few
-- tens of thousands of rows. pg_trgm + GIN indexes let `ILIKE '%term%'`
-- use an index instead of scanning every row.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX "Lead_fullName_trgm_idx" ON "Lead" USING GIN ("fullName" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Lead_email_trgm_idx" ON "Lead" USING GIN ("email" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Lead_phone_trgm_idx" ON "Lead" USING GIN ("phone" gin_trgm_ops);
