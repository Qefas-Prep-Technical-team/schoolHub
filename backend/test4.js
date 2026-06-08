const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const submission = await prisma.assignmentSubmission.findFirst({
    include: { assignment: true }
  });
  if (!submission) return;
  const a = submission.assignment;
  
  const teacher = await prisma.teacher.findUnique({ where: { id: a.teacherId } });
  const validTeacherId = teacher ? teacher.id : null;
  console.log("Valid teacher ID:", validTeacherId);
  
  try {
     const grade = await prisma.grade.upsert({
        where: { id: `grade-assignment-${submission.id}` },
        update: {
          score: submission.score || 0,
          maxMarks: a.totalMarks || 100,
          updatedAt: new Date(),
        },
        create: {
          id: `grade-assignment-${submission.id}`,
          studentId: submission.studentId,
          schoolId: a.schoolId,
          teacherId: validTeacherId,
          classId: a.classId,
          subject: "Assignment",
          assessmentType: "ASSIGNMENT",
          score: submission.score || 0,
          maxMarks: a.totalMarks || 100,
          remarks: a.title,
        }
      });
      console.log("Grade created:", grade);
  } catch (err) {
      console.error("Failed to create grade:", err);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
