const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.exam.findMany({ include: { papers: { include: { paper: true } } } }).then(r => console.log(JSON.stringify(r.filter(e => e.title.toLowerCase().includes('english')), null, 2))).finally(() => prisma.$disconnect());
