-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "upvotecount" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Story" ADD FOREIGN KEY ("postal") REFERENCES "PostalCode"("code") ON DELETE CASCADE ON UPDATE CASCADE;
