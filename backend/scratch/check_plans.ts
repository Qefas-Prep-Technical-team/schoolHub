import prisma from "../src/config/database";

async function main() {
  const plans = await prisma.subscriptionPlan.findMany({
    select: { category: true, type: true, isActive: true }
  });
  console.log(JSON.stringify(plans, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
