import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const subs = await prisma.assignmentSubmission.findMany({
    where: { assignmentId: '9bf8f095-71ca-4f71-8fed-5477b0d3964e' }
  });
  console.log(subs);
}

main().finally(() => prisma.$disconnect());
