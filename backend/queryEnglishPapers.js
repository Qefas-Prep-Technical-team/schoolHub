const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.subjectExamPaper.findMany({ include: { exams: { include: { exam: true } } } })
  .then(r => console.log(JSON.stringify(r.filter(p => p.title.includes('English')).map(p => ({ title: p.title, exams: p.exams.map(e => ({ title: e.exam.title, scope: e.exam.scope, classId: e.exam.classId })) })), null, 2)))
  .finally(() => prisma.$disconnect());
