import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });
  console.log(assignments);
}

main().finally(() => prisma.$disconnect());
