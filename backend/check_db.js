const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const questions = await prisma.assignmentQuestion.findMany({
    where: { assignmentId: '9bf8f095-71ca-4f71-8fed-5477b0d3964e' },
    select: { id: true, marks: true }
  });
  console.log(questions);
  
  const answers = await prisma.assignmentAnswer.findMany({
    where: { 
        submission: {
            assignmentId: '9bf8f095-71ca-4f71-8fed-5477b0d3964e'
        }
    },
    select: { id: true, score: true, questionId: true }
  });
  console.log(answers);
}

main().finally(() => prisma.$disconnect());
