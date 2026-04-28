const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PRICING_PLANS = [
  {
    "category": "schools",
    "tabs": [
      { "type": "free", "name": "Free Tier", "pricing": { "monthly": 0, "yearly": 0 }, "features": ["50 Student Enrolments", "3 Active Classes"] },
      { "type": "starter", "name": "Institutional Starter", "pricing": { "monthly": 5000, "yearly": 50000 }, "features": ["200 Student Capacity"] },
      { "type": "growth", "name": "Institutional Growth", "pricing": { "monthly": 15000, "yearly": 150000 }, "features": ["Unlimited Student Capacity"] }
    ]
  }
];

async function main() {
  console.log("Seeding core school plans...");
  for (const group of PRICING_PLANS) {
    for (const tab of group.tabs) {
      await prisma.subscriptionPlan.upsert({
        where: { category_type: { category: group.category, type: tab.type } },
        update: { name: tab.name, isActive: true },
        create: {
          name: tab.name,
          type: tab.type,
          category: group.category,
          monthlyPrice: tab.pricing.monthly,
          yearlyPrice: tab.pricing.yearly,
          features: tab.features,
          isActive: true
        }
      });
      console.log(`Synced ${group.category}:${tab.type}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
