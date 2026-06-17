const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const grade = await prisma.grade.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      subjectPaper: { include: { subject: true } }
    }
  });
  console.log(JSON.stringify(grade, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
