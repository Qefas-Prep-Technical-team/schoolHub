const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.exam.findMany().then(r => console.log(JSON.stringify(r.map(e => ({ title: e.title, sessionId: e.sessionId, term: e.term })), null, 2))).finally(() => prisma.$disconnect());
