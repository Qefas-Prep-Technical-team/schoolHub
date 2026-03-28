-- CreateEnum
CREATE TYPE "ExamAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'SCORED', 'EXPIRED');

-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "allowImmediateResult" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "resultReleaseAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" "ExamAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_exam_attempts" (
    "id" TEXT NOT NULL,
    "examAttemptId" TEXT NOT NULL,
    "subjectPaperId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_exam_answers" (
    "id" TEXT NOT NULL,
    "subjectExamAttemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "scoreAwarded" DOUBLE PRECISION,
    "requiresManualReview" BOOLEAN NOT NULL DEFAULT false,
    "manuallyReviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_exam_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempts_examId_studentId_key" ON "exam_attempts"("examId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "subject_exam_attempts_examAttemptId_subjectPaperId_key" ON "subject_exam_attempts"("examAttemptId", "subjectPaperId");

-- CreateIndex
CREATE UNIQUE INDEX "subject_exam_answers_subjectExamAttemptId_questionId_key" ON "subject_exam_answers"("subjectExamAttemptId", "questionId");

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_exam_attempts" ADD CONSTRAINT "subject_exam_attempts_examAttemptId_fkey" FOREIGN KEY ("examAttemptId") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_exam_attempts" ADD CONSTRAINT "subject_exam_attempts_subjectPaperId_fkey" FOREIGN KEY ("subjectPaperId") REFERENCES "subject_exam_papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_exam_answers" ADD CONSTRAINT "subject_exam_answers_subjectExamAttemptId_fkey" FOREIGN KEY ("subjectExamAttemptId") REFERENCES "subject_exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_exam_answers" ADD CONSTRAINT "subject_exam_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "subject_exam_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
