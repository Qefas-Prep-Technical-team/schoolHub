const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getParentDashboardService } = require('./src/modules/parent/parent.service');

async function main() {
  const parentLinks = await prisma.parentChildLink.findMany({ include: { student: { include: { attendances: true } } } });
  for (const link of parentLinks) {
    if (link.student.attendances.length === 0) {
      const data = await getParentDashboardService(link.parentId, link.studentId);
      console.log(`Student ${link.studentId} has no attendance. Dashboard stats:`, JSON.stringify(data.stats, null, 2));
      return;
    }
  }
  console.log("No student without attendance found.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
