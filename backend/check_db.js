const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const exams = await prisma.exam.findMany({ select: { title: true, category: true } });
  console.log("EXAMS:", exams);

  const papers = await prisma.subjectExamPaper.findMany({ select: { title: true, category: true } });
  console.log("PAPERS:", papers);
}

main().catch(console.error).finally(() => prisma.$disconnect());
