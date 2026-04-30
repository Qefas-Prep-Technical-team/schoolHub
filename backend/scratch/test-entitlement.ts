import prisma from "../src/config/database";
import { EntitlementService } from "../src/modules/subscription/entitlement.service";
import { FeatureService } from "../src/modules/subscription/feature.service";
import { PricingService } from "../src/modules/platform/billing/pricing.service";

async function runTest() {
  console.log("🚀 Starting Entitlement System Test...");

  try {
    // 1. Setup: Create a test feature in manifest
    const featureTag = "test_feature_" + Date.now();
    const feature = await FeatureService.saveFeature({
      name: "Test Feature",
      tag: featureTag,
      category: "TEST"
    });
    console.log(`✅ Created test feature: ${feature.tag}`);

    // 2. Setup: Create a test plan
    const planType = "test_plan_" + Date.now();
    const plan = await PricingService.savePlan({
      name: "Test Plan",
      type: planType,
      category: "TEST",
      features: ["legacy_feature"], // Legacy system
      featureAccess: [
        { tag: featureTag, enabled: true } // New relational system
      ]
    });
    console.log(`✅ Created test plan: ${plan.id}`);

    // 3. Setup: Create a test school and subscription
    const school = await prisma.school.create({
      data: {
        name: "Test School",
        schoolCode: "TS-" + Date.now(),
        tenantId: "tenant-" + Date.now(),
        plan: planType
      }
    });
    
    await prisma.schoolSubscription.create({
      data: {
        schoolId: school.id,
        subscriptionPlanId: plan.id,
        status: "ACTIVE"
      }
    });
    console.log(`✅ Created test school and subscription`);

    // 4. Setup: Create a test user (Admin)
    const admin = await prisma.admin.create({
      data: {
        name: "Test Admin",
        email: `test_admin_${Date.now()}@example.com`,
        adminCode: "AC-" + Date.now(),
        role: "ADMIN"
      }
    });
    console.log(`✅ Created test admin: ${admin.id}`);

    // 5. Verify Access: Legacy system
    const legacyAccess = await EntitlementService.hasFeatureAccess(admin.id, "legacy_feature", school.id);
    console.log(`🔍 Legacy Access Check: ${legacyAccess ? "PASS" : "FAIL"}`);

    // 6. Verify Access: New relational system
    const newAccess = await EntitlementService.hasFeatureAccess(admin.id, featureTag, school.id);
    console.log(`🔍 New Relational Access Check: ${newAccess ? "PASS" : "FAIL"}`);

    // 7. Verify Access: Disabled feature
    await prisma.planFeatureAccess.update({
      where: { planId_featureId: { planId: plan.id, featureId: feature.id } },
      data: { enabled: false }
    });
    const disabledAccess = await EntitlementService.hasFeatureAccess(admin.id, featureTag, school.id);
    console.log(`🔍 Disabled Feature Access Check: ${!disabledAccess ? "PASS (Denied)" : "FAIL (Allowed)"}`);

    // Cleanup
    console.log("🧹 Cleaning up...");
    await prisma.schoolSubscription.delete({ where: { schoolId: school.id } });
    await prisma.school.delete({ where: { id: school.id } });
    await prisma.admin.delete({ where: { id: admin.id } });
    await prisma.planFeatureAccess.deleteMany({ where: { planId: plan.id } });
    await prisma.subscriptionPlan.delete({ where: { id: plan.id } });
    await prisma.featureManifest.delete({ where: { id: feature.id } });
    console.log("✨ Cleanup complete");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
