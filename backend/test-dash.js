const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getParentDashboardService } = require('./src/modules/parent/parent.service');

async function main() {
  const parent = await prisma.parent.findFirst();
  if (parent) {
    const data = await getParentDashboardService(parent.id);
    console.log("Stats:", JSON.stringify(data.stats, null, 2));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
