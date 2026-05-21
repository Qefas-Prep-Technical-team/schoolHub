const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const featureKey = "aiInsights";

  // 1. Get all schools and their IDs
  const schools = await prisma.school.findMany({
    select: { id: true, name: true, planId: true }
  });
  console.log("=== ALL SCHOOLS ===");
  schools.forEach(s => console.log(`  name: ${s.name}, id: ${s.id}, planId: ${s.planId}`));

  // 2. Get all SchoolSubscriptions
  const subs = await prisma.schoolSubscription.findMany({
    include: { subscriptionPlan: true }
  });
  console.log("\n=== ALL SCHOOL SUBSCRIPTIONS ===");
  subs.forEach(s => console.log(`  schoolId: ${s.schoolId}, plan: ${s.subscriptionPlan?.name}, status: ${s.status}, planId: ${s.subscriptionPlanId}`));

  // 3. Get feature
  const feature = await prisma.platformFeature.findUnique({ where: { featureKey } });
  console.log("\n=== FEATURE ===");
  console.log(feature);

  // 4. Try matching by schoolId from subscription
  if (subs.length > 0 && feature) {
    const sub = subs[0];
    const access = await prisma.planFeatureAccess.findUnique({
      where: {
        planId_featureId: {
          planId: sub.subscriptionPlanId,
          featureId: feature.id
        }
      }
    });
    console.log(`\n=== PLAN FEATURE ACCESS for planId: ${sub.subscriptionPlanId} ===`);
    console.log(access);
  }

  // 5. Try resolveSchoolId equivalent — check if tenants map to schools
  const admins = await prisma.admin.findMany({
    include: {
      schoolAdmins: { where: { active: true }, take: 1 }
    }
  });
  console.log("\n=== ADMIN -> schoolId mappings ===");
  admins.forEach(a => {
    console.log(`  adminId: ${a.id}, tenantId: ${a.tenantId}, schoolId: ${a.schoolAdmins[0]?.schoolId ?? 'NONE'}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
