const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const latestGrade = await prisma.grade.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log("Latest grade:", latestGrade.status, latestGrade.score);
}

main().catch(console.error).finally(() => prisma.$disconnect());
