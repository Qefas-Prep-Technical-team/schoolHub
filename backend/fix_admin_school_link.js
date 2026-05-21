const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminId = 'e3639235-c2c5-49d1-b311-3b637f28116e';
  const schoolId = 'cbef052a-277c-4987-906c-7e8a41c9ed5e';

  // Check if already exists
  const existing = await prisma.schoolAdmin.findFirst({
    where: { adminId, schoolId }
  });

  if (existing) {
    console.log('SchoolAdmin record already exists:', existing);
    // Just make sure it's active
    const updated = await prisma.schoolAdmin.update({
      where: { id: existing.id },
      data: { active: true }
    });
    console.log('Updated to active:', updated);
    return;
  }

  // Create the link
  const link = await prisma.schoolAdmin.create({
    data: {
      adminId,
      schoolId,
      active: true
    }
  });
  console.log('✅ Created SchoolAdmin link:', link);

  // Also update the admin tenantId to match the school
  const updatedAdmin = await prisma.admin.update({
    where: { id: adminId },
    data: { tenantId: 'sch-377965' }
  });
  console.log('✅ Updated admin tenantId to sch-377965:', updatedAdmin.tenantId);
}

main().catch(console.error).finally(() => prisma.$disconnect());
