const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const link = await prisma.parentChildLink.findFirst({
    where: { status: 'active' },
  });
  console.log("Student ID:", link.studentId);
  const grades = await prisma.grade.findMany({ where: { studentId: link.studentId } });
  console.log("Grades Count:", grades.length);
  if (grades.length > 0) {
    console.log("First Grade Status:", grades[0].status);
  }
}
test().finally(() => prisma.$disconnect());
