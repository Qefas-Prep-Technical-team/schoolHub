/*
  Warnings:

  - A unique constraint covering the columns `[schoolId,code]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subjects_schoolId_code_key" ON "subjects"("schoolId", "code");
