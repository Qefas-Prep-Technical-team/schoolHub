/**
 * Simulates exactly what getSchoolPerformanceAnalysisService does
 * to verify the hasAiAccess flag.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resolveSchoolId(schoolId) {
  const school = await prisma.school.findFirst({
    where: { OR: [{ id: schoolId }, { tenantId: schoolId }] },
    select: { id: true }
  });
  return school ? school.id : null;
}

async function checkSchoolFeatureAccess(schoolId, featureKey) {
  const feature = await prisma.platformFeature.findUnique({ where: { featureKey } });
  if (!feature) return false;

  const schoolSubscription = await prisma.schoolSubscription.findUnique({
    where: { schoolId },
    include: { subscriptionPlan: true }
  });

  if (!schoolSubscription || schoolSubscription.status !== 'ACTIVE') return false;

  const planFeatureAccess = await prisma.planFeatureAccess.findUnique({
    where: {
      planId_featureId: {
        planId: schoolSubscription.subscriptionPlanId,
        featureId: feature.id
      }
    }
  });

  return !!(planFeatureAccess && planFeatureAccess.enabled);
}

async function main() {
  // Test with the exact schoolId the frontend sends (user?.schools?.[0]?.schoolId || user?.tenantId)
  // Let's test BOTH possible values
  const testIds = [
    'cbef052a-277c-4987-906c-7e8a41c9ed5e', // direct school UUID
    'sch-377965',                             // school tenantId
    'default-tenant-id'                       // broken admin tenantId (old fallback)
  ];

  for (const id of testIds) {
    const canonicalId = await resolveSchoolId(id);
    console.log(`\ninput: ${id}`);
    console.log(`  canonicalId: ${canonicalId}`);
    if (canonicalId) {
      const hasAccess = await checkSchoolFeatureAccess(canonicalId, 'aiInsights');
      console.log(`  hasAiAccess: ${hasAccess}`);
    } else {
      console.log(`  hasAiAccess: false (canonicalId is null)`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
