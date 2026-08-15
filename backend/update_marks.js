const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assignmentId = '9bf8f095-71ca-4f71-8fed-5477b0d3964e';
  
  // Update all questions for this assignment to have marks = 10
  await prisma.assignmentQuestion.updateMany({
    where: { assignmentId },
    data: { marks: 10 }
  });
  
  // Also update totalMarks of the assignment to 100 (since there are 10 questions)
  await prisma.assignment.updateMany({
    where: { id: assignmentId },
    data: { totalMarks: 100 }
  });
  
  console.log("Updated questions and assignment totalMarks successfully.");
}

main().finally(() => prisma.$disconnect());
