const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const classId = 'c464ec00-4914-4ca0-9606-dd8c3b51a354';
  const grades = await prisma.grade.findMany({
    where: { classId },
    select: {
      id: true,
      subject: true,
      teacherId: true,
      assessmentType: true,
      category: true,
      score: true
    }
  });
  console.log('Grades count in class:', grades.length);
  console.log(JSON.stringify(grades, null, 2));

  // Find teachers assigned to this class
  const classTeachers = await prisma.classTeacher.findMany({
    where: { classId },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          teacherSubjects: {
            include: { subject: true }
          }
        }
      }
    }
  });
  console.log('Class teachers:', JSON.stringify(classTeachers, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
