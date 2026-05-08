import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkFreePlan() {
  const plan = await prisma.subscriptionPlan.findFirst({
    where: {
      type: "free",
      category: "schools",
    },
  });
  console.log('Free school plan:', plan ? plan.name : 'NOT FOUND');
}

checkFreePlan()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
