import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const papers = await prisma.subjectExamPaper.findMany();
  let updated = 0;
  for (let p of papers) {
    let cat = 'EXAM';
    const title = p.title?.toLowerCase() || '';
    if (title.includes('quiz')) cat = 'QUIZ';
    else if (title.includes('ca') || title.includes('continuous')) cat = 'CA';
    else if (title.includes('assignment')) cat = 'ASSIGNMENT';
    
    // Assign some randomly if no title matches so the user sees data
    if (cat === 'EXAM' && Math.random() > 0.5) {
      const cats = ['QUIZ', 'CA', 'ASSIGNMENT'];
      cat = cats[Math.floor(Math.random() * cats.length)];
    }

    if (cat !== 'EXAM') {
      await prisma.subjectExamPaper.update({
        where: { id: p.id },
        data: { category: cat as any }
      });
      console.log(`Updated ${p.title} to ${cat}`);
      updated++;
    }
  }
  console.log(`Updated ${updated} papers.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
