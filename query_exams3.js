const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const publishedCounts = await prisma.exam.groupBy({
    by: ['category'],
    where: { status: 'PUBLISHED' },
    _count: { id: true }
  });
  console.log("PUBLISHED EXAMS BY CATEGORY:", publishedCounts);

  const cas = await prisma.exam.findMany({
    where: { category: 'CA' },
    select: { id: true, title: true, status: true, classId: true }
  });
  console.log("ALL CAS:", cas);
  
  const quizzes = await prisma.exam.findMany({
    where: { category: 'QUIZ' },
    select: { id: true, title: true, status: true, classId: true }
  });
  console.log("ALL QUIZZES:", quizzes);
}
main().finally(() => process.exit(0));
