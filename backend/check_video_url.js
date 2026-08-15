const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assignment = await prisma.assignment.findUnique({
    where: { id: '9bf8f095-71ca-4f71-8fed-5477b0d3964e' },
    select: { title: true, videoUrl: true, referenceUrl: true }
  });
  console.log("Assignment Video URL:", assignment.videoUrl);
}

main().finally(() => prisma.$disconnect());
