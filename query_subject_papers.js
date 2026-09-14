const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const exams = await prisma.exam.findMany({
    take: 1,
    include: {
      subjectExamPapers: {
        include: {
          subjectPaper: {
            include: {
              subject: true,
              questions: true,
              _count: true
            }
          }
        }
      }
    }
  });
  console.dir(exams[0].subjectExamPapers, { depth: null });
}
main().finally(() => process.exit(0));
