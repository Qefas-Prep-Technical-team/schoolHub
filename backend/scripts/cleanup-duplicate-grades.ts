import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for duplicate grades...");
  
  const duplicates = await prisma.$queryRaw`
    SELECT "studentId", "examId", "subjectPaperId", COUNT(*)
    FROM grades
    WHERE "examId" IS NOT NULL AND "subjectPaperId" IS NOT NULL
    GROUP BY "studentId", "examId", "subjectPaperId"
    HAVING COUNT(*) > 1
  `;

  console.log("Duplicates found:", duplicates);
  
  if (Array.isArray(duplicates) && duplicates.length > 0) {
    console.log("Cleaning up duplicates...");
    for (const dup of duplicates) {
      const records = await prisma.grade.findMany({
        where: {
          studentId: dup.studentId,
          examId: dup.examId,
          subjectPaperId: dup.subjectPaperId
        },
        orderBy: { updatedAt: 'desc' }
      });

      // Keep the most recent one (index 0), delete the others
      const toDelete = records.slice(1);
      for (const record of toDelete) {
        await prisma.grade.delete({ where: { id: record.id } });
        console.log(`Deleted duplicate grade ${record.id} for student ${dup.studentId}`);
      }
    }
  }
  
  console.log("Done.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
