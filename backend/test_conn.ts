import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  console.log('Testing connection...');
  const result = await prisma.$queryRaw`SELECT 1`;
  console.log('Success:', result);
}

test()
  .catch(e => console.error('Failed:', e))
  .finally(() => prisma.$disconnect());
