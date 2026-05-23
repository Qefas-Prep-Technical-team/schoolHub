import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const models = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
  console.log("Models:", models);
}

run().finally(() => prisma.$disconnect());
