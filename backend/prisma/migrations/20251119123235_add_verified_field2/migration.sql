/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Teacher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teacherCode]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherCode` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "createdAt",
DROP COLUMN "fullName",
DROP COLUMN "phone",
DROP COLUMN "updatedAt",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "teacherCode" TEXT NOT NULL,
ADD COLUMN     "tenantIds" TEXT[],
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "studentCode" TEXT NOT NULL,
    "tenantIds" TEXT[],
    "teacherCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentChildLink" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "studentCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentChildLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SchoolStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SchoolStudents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TeacherStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TeacherStudents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentCode_key" ON "Student"("studentCode");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_email_key" ON "Parent"("email");

-- CreateIndex
CREATE INDEX "VerificationCode_email_idx" ON "VerificationCode"("email");

-- CreateIndex
CREATE INDEX "VerificationCode_code_idx" ON "VerificationCode"("code");

-- CreateIndex
CREATE INDEX "_SchoolStudents_B_index" ON "_SchoolStudents"("B");

-- CreateIndex
CREATE INDEX "_TeacherStudents_B_index" ON "_TeacherStudents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_teacherCode_key" ON "Teacher"("teacherCode");

-- AddForeignKey
ALTER TABLE "ParentChildLink" ADD CONSTRAINT "ParentChildLink_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildLink" ADD CONSTRAINT "ParentChildLink_studentCode_fkey" FOREIGN KEY ("studentCode") REFERENCES "Student"("studentCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchoolStudents" ADD CONSTRAINT "_SchoolStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchoolStudents" ADD CONSTRAINT "_SchoolStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeacherStudents" ADD CONSTRAINT "_TeacherStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeacherStudents" ADD CONSTRAINT "_TeacherStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
