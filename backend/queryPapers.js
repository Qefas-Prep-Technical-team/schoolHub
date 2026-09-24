const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.subjectExamPaper.findMany().then(r => console.log(JSON.stringify(r.map(p => ({ id: p.id, title: p.title, category: p.category })), null, 2))).finally(() => prisma.$disconnect());
