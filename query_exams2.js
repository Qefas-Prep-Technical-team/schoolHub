const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const publishedCounts = await prisma.exam.groupBy({
    by: ['category'],
    where: { status: 'PUBLISHED' },
    _count: { id: true }
  });
  console.log("PUBLISHED EXAMS BY CATEGORY:", publishedCounts);

  const studentExams = await prisma.exam.findMany({
    where: {
      status: 'PUBLISHED'
    },
    select: { id: true, category: true, classId: true }
  });
  console.log("ALL PUBLISHED:", studentExams);
}
main().finally(() => prisma.$disconnect());
