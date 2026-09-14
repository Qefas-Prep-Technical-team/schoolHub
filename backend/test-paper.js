const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const paperId = '4519aedd-813f-4b1f-8e66-b805abd54b39';
  
  const paper = await prisma.subjectExamPaper.findUnique({
    where: { id: paperId },
    include: {
      examAttempts: {
        include: {
          examAttempt: {
            include: { student: true }
          }
        }
      },
      grades: {
        include: { student: true }
      },
      exams: {
        include: {
          exam: {
            include: {
              examAttempts: {
                include: { student: true }
              }
            }
          }
        }
      }
    }
  });

  if (!paper) {
    console.log("Paper not found!");
    return;
  }

  console.log("Found Paper:", paper.title);
  console.log("examAttempts count:", paper.examAttempts.length);
  console.log("grades count:", paper.grades.length);
  console.log("linked exams count:", paper.exams.length);
  
  if (paper.exams.length > 0) {
    for (const link of paper.exams) {
       console.log(`Exam ${link.exam.id} attempts count:`, link.exam.examAttempts.length);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
