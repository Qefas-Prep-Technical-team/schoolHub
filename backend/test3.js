const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const submission = await prisma.assignmentSubmission.findFirst({
    include: { assignment: true }
  });
  console.log("Submission:", submission);
  if (!submission) return;
  
  const assignment = submission.assignment;
  const subjectName = "Assignment";
  
  try {
     const grade = await prisma.grade.upsert({
        where: { id: `grade-assignment-${submission.id}` },
        update: {
          score: submission.score || 0,
          maxMarks: assignment.totalMarks || 100,
          updatedAt: new Date(),
        },
        create: {
          id: `grade-assignment-${submission.id}`,
          studentId: submission.studentId,
          schoolId: assignment.schoolId,
          teacherId: assignment.teacherId,
          classId: assignment.classId,
          subject: subjectName,
          assessmentType: "ASSIGNMENT",
          score: submission.score || 0,
          maxMarks: assignment.totalMarks || 100,
          remarks: assignment.title,
        }
      });
      console.log("Grade created:", grade);
  } catch (err) {
      console.error("Failed to create grade:", err);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
