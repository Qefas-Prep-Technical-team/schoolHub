import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`ALTER TABLE "behaviour_alerts" DROP CONSTRAINT IF EXISTS "behaviour_alerts_reportedById_fkey"`;
    console.log("Successfully dropped foreign key constraint.");
  } catch (error) {
    console.error("Error dropping constraint:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
