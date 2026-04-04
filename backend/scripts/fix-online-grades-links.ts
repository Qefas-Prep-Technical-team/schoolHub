import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for grades missing subjectPaperId...");
  
  const grades = await prisma.grade.findMany({
    where: {
      subjectPaperId: null,
      subjectExamAttemptId: { not: null }
    }
  });

  console.log(`Found ${grades.length} grades to fix.`);
  
  for (const grade of grades) {
    // Find the subject exam attempt to get the paper ID
    const sa = await prisma.subjectExamAttempt.findUnique({
      where: { id: grade.subjectExamAttemptId! }
    });

    if (sa && sa.subjectPaperId) {
      await prisma.grade.update({
        where: { id: grade.id },
        data: { subjectPaperId: sa.subjectPaperId }
      });
      console.log(`Fixed grade ${grade.id} for student ${grade.studentId} - linked to paper ${sa.subjectPaperId}`);
    }
  }
  
  console.log("Done.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
