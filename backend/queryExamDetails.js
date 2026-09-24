const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.exam.findUnique({
  where: { id: 'a2674d07-0b6d-4997-ad9e-91ff52d098c4' },
  include: { subjectExamPapers: { include: { subjectPaper: true } } }
}).then(r => console.log(JSON.stringify(r, null, 2))).finally(() => prisma.$disconnect());
