const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const settings = await prisma.platformSettings.findMany();
  console.log("Platform settings:", settings);
}
main().catch(console.error).finally(() => prisma.$disconnect());
