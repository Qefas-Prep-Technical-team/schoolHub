/*
  Warnings:

  - Added the required column `studentCode` to the `parent_child_links` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "parent_child_links" ADD COLUMN     "studentCode" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "parent_child_links_studentCode_idx" ON "parent_child_links"("studentCode");
