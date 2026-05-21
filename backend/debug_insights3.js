const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Simulate what resolveSchoolId does with "default-tenant-id"
  const testId = "default-tenant-id";
  const school = await prisma.school.findFirst({
    where: {
      OR: [
        { id: testId },
        { tenantId: testId }
      ]
    },
    select: { id: true, tenantId: true, name: true }
  });
  console.log(`resolveSchoolId("${testId}") =>`, school);

  // Check the actual tenantId on the school
  const allSchools = await prisma.school.findMany({ select: { id: true, tenantId: true, name: true } });
  console.log("\nAll schools with their tenantIds:", allSchools);

  // Check the admin's schools[] relation
  const admin = await prisma.admin.findUnique({
    where: { id: 'e3639235-c2c5-49d1-b311-3b637f28116e' },
    include: {
      schoolAdmins: true
    }
  });
  console.log("\nAdmin record:", JSON.stringify(admin, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
