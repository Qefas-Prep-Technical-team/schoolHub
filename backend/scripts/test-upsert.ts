import prisma from "../src/config/database";

async function main() {
  const tab = {
    type: "free",
    name: "Standard Free",
    pricing: { monthly: 0, yearly: 0 },
    description: "test",
    features: ["1 student"],
    hasTrial: false,
    trialDays: 0,
    isPopular: false,
    storage: "1GB"
  };
  const category = "schools";

  console.log("Testing single upsert...");
  try {
    const res = await prisma.subscriptionPlan.upsert({
      where: { category_type: { category, type: tab.type } },
      update: {
        name: tab.name,
        monthlyPrice: tab.pricing.monthly,
        yearlyPrice: tab.pricing.yearly,
        description: tab.description,
        features: tab.features,
        hasTrial: tab.hasTrial,
        trialDays: tab.trialDays,
        isPopular: tab.isPopular as any, // In case it's not in schema
        isActive: true,
      },
      create: {
        name: tab.name,
        type: tab.type,
        category: category,
        monthlyPrice: tab.pricing.monthly,
        yearlyPrice: tab.pricing.yearly,
        description: tab.description,
        features: tab.features,
        hasTrial: tab.hasTrial,
        trialDays: tab.trialDays,
        isPopular: tab.isPopular as any,
        isActive: true,
      }
    });
    console.log("Success:", res);
  } catch (e) {
    console.error("Failed:", e);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
