import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const paperId = 'f65a11ef-b187-4564-9e94-19cb4d527bd2';
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: paperId },
  });

  if (!paper) {
    console.log(`Paper with ID ${paperId} NOT FOUND`);
  } else {
    console.log(`Paper ${paperId} found:`, JSON.stringify(paper, null, 2));
    
    // Test update
    try {
      const updated = await prisma.subjectExamPaper.update({
        where: { id: paperId },
        data: { examId: null }
      });
      console.log("SUCCESS: Manual unlink worked:", updated.id);
    } catch (err: any) {
      console.error("FAILURE: Manual unlink failed:", err.message);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
