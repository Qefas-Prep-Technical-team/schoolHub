const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const records = await prisma.studentSubjectTermResult.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' }
  });
  console.log(JSON.stringify(records, null, 2));
}
main().finally(() => prisma.$disconnect());
