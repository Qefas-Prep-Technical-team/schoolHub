const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const grades = await prisma.grade.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      subjectPaper: {
        include: { subject: true }
      }
    }
  });
  console.log(JSON.stringify(grades, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
