import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allPapers = await prisma.subjectExamPaper.findMany({
    include: {
      subject: true,
      exam: true,
    }
  });

  console.log(`Total papers: ${allPapers.length}`);
  console.log(`Unlinked papers (examId is null): ${allPapers.filter(p => !p.examId).length}`);
  
  if (allPapers.length > 0) {
    console.log("Sample Paper:", JSON.stringify({
      id: allPapers[0].id,
      title: allPapers[0].title,
      examId: allPapers[0].examId,
      subjectName: allPapers[0].subject?.name,
      schoolId: allPapers[0].subject?.schoolId
    }, null, 2));
  }

  const allTeachers = await prisma.teacher.findMany();
  console.log(`Total teachers: ${allTeachers.length}`);
  if (allTeachers.length > 0) {
    console.log("Sample Teacher:", JSON.stringify({
      id: allTeachers[0].id,
      name: allTeachers[0].name,
      schoolId: allTeachers[0].schoolId
    }, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
