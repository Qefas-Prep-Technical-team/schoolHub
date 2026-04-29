import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const schools = await prisma.school.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      tenantId: true,
      schoolCode: true
    }
  });
  console.log('Schools found:', JSON.stringify(schools, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
