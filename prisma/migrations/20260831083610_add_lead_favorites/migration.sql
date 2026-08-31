-- CreateTable
CREATE TABLE "_LeadFavorites" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_LeadFavorites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_LeadFavorites_B_index" ON "_LeadFavorites"("B");

-- AddForeignKey
ALTER TABLE "_LeadFavorites" ADD CONSTRAINT "_LeadFavorites_A_fkey" FOREIGN KEY ("A") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeadFavorites" ADD CONSTRAINT "_LeadFavorites_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
