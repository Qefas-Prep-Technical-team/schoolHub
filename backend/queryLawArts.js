const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.exam.findMany({ where: { title: { contains: 'Law & Arts' } } }).then(r => console.log(JSON.stringify(r.map(e => ({ title: e.title, category: e.category })), null, 2))).finally(() => prisma.$disconnect());
