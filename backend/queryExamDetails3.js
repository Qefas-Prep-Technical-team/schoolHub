const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.exam.findUnique({
  where: { id: 'a2674d07-0b6d-4997-ad9e-91ff52d098c4' },
  include: { subjectExamPapers: true }
}).then(r => console.log('Exam:', JSON.stringify(r, null, 2))).catch(e => console.error(e)).finally(() => prisma.$disconnect());
