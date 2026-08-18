const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const counts = await prisma.exam.groupBy({
    by: ['category'],
    _count: { id: true }
  });
  console.log("ALL EXAMS:", counts);

  // Check how many belong to any active student
  const studentExams = await prisma.exam.findMany({
    where: {
      status: 'PUBLISHED'
    },
    select: { id: true, category: true, classId: true }
  });
  console.log("PUBLISHED EXAMS:", studentExams.length);
}
main().finally(() => prisma.$disconnect());
