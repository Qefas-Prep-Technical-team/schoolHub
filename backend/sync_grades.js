const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { status: 'GRADED', score: { not: null } },
    include: { assignment: true }
  });
  
  let count = 0;
  for (const submission of submissions) {
    const a = submission.assignment;
    
    let subjectName = "Assignment";
    if (a.subjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: a.subjectId } });
      if (subject) subjectName = subject.name;
    }
    
    let validTeacherId = null;
    if (a.teacherId) {
       const teacher = await prisma.teacher.findUnique({ where: { id: a.teacherId } });
       if (teacher) validTeacherId = teacher.id;
    }
    
    try {
       await prisma.grade.upsert({
          where: { id: `grade-assignment-${submission.id}` },
          update: {
            score: submission.score,
            maxMarks: a.totalMarks || 100,
            updatedAt: new Date(),
          },
          create: {
            id: `grade-assignment-${submission.id}`,
            studentId: submission.studentId,
            schoolId: a.schoolId,
            teacherId: validTeacherId,
            classId: a.classId,
            subject: subjectName,
            assessmentType: "ASSIGNMENT",
            score: submission.score,
            maxMarks: a.totalMarks || 100,
            remarks: a.title,
          }
        });
        count++;
    } catch (err) {
        console.error("Failed to sync grade for submission", submission.id, err.message);
    }
  }
  console.log("Successfully synced", count, "grades out of", submissions.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
