const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$connect()
  .then(() => {
    console.log('Connected via Prisma!');
    process.exit(0);
  })
  .catch(e => {
    console.error('Failed via Prisma:', e);
    process.exit(1);
  });
