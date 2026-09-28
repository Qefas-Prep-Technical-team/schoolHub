const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const features = await prisma.platformFeature.findMany({
    where: { featureKey: 'linkingHub' }
  });
  console.log('PlatformFeatures (linkingHub):', JSON.stringify(features, null, 2));

  const plans = await prisma.subscriptionPlan.findMany({
    where: { category: 'schools' },
    include: { featureAccess: { include: { feature: true } } }
  });
  
  const mapped = plans.map(p => ({
    plan: p.name,
    adminLinkingAccess: p.featureAccess.filter(f => f.feature?.featureKey === 'linkingHub' || f.featureKey === 'linkingHub')
  }));
  console.log('Plans with LinkingHub:', JSON.stringify(mapped, null, 2));
}
main().finally(() => prisma.$disconnect());
