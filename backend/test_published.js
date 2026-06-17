const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const link = await prisma.parentChildLink.findFirst({
    where: { status: 'active' },
  });
  const grades = await prisma.grade.findMany({ where: { studentId: link.studentId, status: 'PUBLISHED' } });
  console.log("Published Grades Count:", grades.length);
}
test().finally(() => prisma.$disconnect());
