const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExams() {
  const grades = await prisma.grade.findMany({
    include: {
      student: { select: { id: true, name: true } }
    }
  });
  console.log('--- GRADES ---');
  console.log(JSON.stringify(grades, null, 2));

  const exams = await prisma.exam.findMany({
    include: {
      class: { select: { id: true, name: true } }
    }
  });
  console.log('\n--- EXAMS ---');
  console.log(JSON.stringify(exams, null, 2));
}

checkExams()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
