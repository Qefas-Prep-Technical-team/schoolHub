import prisma from "../src/config/database";
import { PricingService } from "../src/modules/platform/billing/pricing.service";
import { PRICING_PLANS } from "../src/modules/payment/plans.data";

async function main() {
  console.log("Force seeding plans from constants...");
  // Pass PRICING_PLANS to force sync (isActive = false then upsert)
  const result = await PricingService.seedFromConstants(PRICING_PLANS);
  console.log("Result:", result);

  const activePlans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    select: {
      name: true,
      hasTrial: true,
      trialDays: true
    }
  });
  console.log("Active plans with trial status:", JSON.stringify(activePlans, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
