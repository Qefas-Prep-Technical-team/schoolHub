import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.subscriptionPlan.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      category: true,
      hasTrial: true,
      trialDays: true,
      isActive: true
    }
  });
  console.log('Plans found:', JSON.stringify(plans, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
