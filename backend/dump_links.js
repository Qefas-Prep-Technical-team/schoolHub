
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- AUDITING PENDING LINK REQUESTS ---');
  const pendingRequests = await prisma.linkRequest.findMany({
    where: { status: 'PENDING' },
    select: {
      id: true,
      linkType: true,
      requesterType: true,
      requesterId: true,
      targetType: true,
      targetId: true,
      schoolId: true,
      targetSchoolId: true,
      requesterCode: true,
      targetCode: true,
    }
  });

  console.log(`TOTAL PENDING: ${pendingRequests.length}`);
  pendingRequests.forEach((req, idx) => {
    console.log(`[${idx+1}] ID: ${req.id} | TYPE: ${req.linkType} | REQ: ${req.requesterType} (${req.requesterCode}) | TGT: ${req.targetType} (${req.targetCode})`);
    console.log(`    schoolId: ${req.schoolId} | targetSchoolId: ${req.targetSchoolId} | targetId: ${req.targetId}`);
  });

  console.log('--- AUDITING ADMIN ACCESS ---');
  const admins = await prisma.admin.findMany({ select: { id: true, name: true } });
  for (const admin of admins) {
    const schools = await prisma.schoolAdmin.findMany({ where: { adminId: admin.id, active: true }, select: { schoolId: true } });
    console.log(`ADMIN: ${admin.name} (ID: ${admin.id}) | SCHOOLS: ${schools.map(s => s.schoolId).join(', ') || 'NONE'}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
