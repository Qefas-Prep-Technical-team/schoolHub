const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const featureKey = "aiInsights";

  // 1. Check if feature exists
  const feature = await prisma.platformFeature.findUnique({
    where: { featureKey }
  });

  if (!feature) {
    console.log(`❌ Feature with key '${featureKey}' NOT FOUND in PlatformFeature table.`);
  } else {
    console.log(`✅ Feature '${featureKey}' FOUND (ID: ${feature.id})`);
  }

  // 2. Fetch all school subscriptions to see what's active
  const subscriptions = await prisma.schoolSubscription.findMany({
    include: {
      school: true,
      subscriptionPlan: true
    }
  });

  console.log(`\nFound ${subscriptions.length} school subscriptions:`);
  
  for (const sub of subscriptions) {
    console.log(`- School: ${sub.school?.name} (ID: ${sub.schoolId})`);
    console.log(`  Plan: ${sub.subscriptionPlan?.name} (Status: ${sub.status})`);
    
    if (feature && sub.subscriptionPlanId) {
      // Check PlanFeatureAccess
      const access = await prisma.planFeatureAccess.findUnique({
        where: {
          planId_featureId: {
            planId: sub.subscriptionPlanId,
            featureId: feature.id
          }
        }
      });
      
      if (access) {
        console.log(`  Access for ${featureKey}: ${access.enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
      } else {
        console.log(`  Access for ${featureKey}: ⚠️ NOT CONFIGURED (No PlanFeatureAccess record)`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
