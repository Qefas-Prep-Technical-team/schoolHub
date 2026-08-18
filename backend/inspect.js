const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.examAttempt.findFirst({
  where: { examId: '5509b044-1391-4443-a4aa-2c58cde1676a' },
  include: {
    subjectExamAttempts: { include: { subjectPaper: { include: { subject: true } } } },
    exam: true
  }
}).then(x => console.log(JSON.stringify(x, null, 2)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
