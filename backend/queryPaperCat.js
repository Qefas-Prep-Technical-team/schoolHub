const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.subjectExamPaper.findMany({ include: { exams: { include: { exam: true } } } })
  .then(r => console.log(JSON.stringify(r.map(p => ({ title: p.title, p_cat: p.category, e_cat: p.exams.map(e => e.exam.category) })), null, 2)))
  .finally(() => prisma.$disconnect());
