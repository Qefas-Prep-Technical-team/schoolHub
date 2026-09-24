const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subject = await prisma.subject.findFirst({
    where: { name: { contains: 'Mathematics' } }
  });
  console.log("Subject:", subject);

  if (subject) {
    const papers = await prisma.subjectExamPaper.findMany({
      where: { subjectId: subject.id }
    });
    console.log("Papers for Subject:", papers.map(p => ({ title: p.title, category: p.category })));

    const exams = await prisma.exam.findMany({
      where: {
        OR: [
          { subjectId: subject.id },
          { subjectExamPapers: { some: { subjectPaper: { subjectId: subject.id } } } }
        ]
      },
      include: {
        subjectExamPapers: { include: { subjectPaper: true } }
      }
    });
    console.log("Exams containing Subject:", exams.map(e => ({ title: e.title, category: e.category, papers: e.subjectExamPapers.map(sep => sep.subjectPaper?.title) })));
  }
}
main().finally(() => prisma.$disconnect());
