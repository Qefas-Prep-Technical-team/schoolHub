import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkPlans() {
  const plans = await prisma.subscriptionPlan.findMany();
  console.log('Total plans found:', plans.length);
  plans.forEach(plan => {
    console.log(`- ID: ${plan.id}, Name: ${plan.name}, Type: ${plan.type}, Category: ${plan.category}, Scope: ${plan.planScope}`);
  });
}

checkPlans()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
