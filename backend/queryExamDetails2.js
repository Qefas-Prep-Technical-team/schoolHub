const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.exam.findUnique({
  where: { id: 'a2674d07-0b6d-4997-ad9e-91ff52d098c4' },
  include: { subjectExamPapers: { include: { paper: true } } }
}).then(r => console.log('Exam:', !!r, r)).catch(e => console.error(e)).finally(() => prisma.$disconnect());
