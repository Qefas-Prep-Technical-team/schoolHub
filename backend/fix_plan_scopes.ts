import { PrismaClient, PlanScope } from '@prisma/client';
const prisma = new PrismaClient();

async function fixPlanScopes() {
  console.log('Starting plan scope correction...');

  const categoryToScope: Record<string, PlanScope> = {
    'students': PlanScope.STUDENT,
    'teachers': PlanScope.TEACHER,
    'parents': PlanScope.PARENT,
    'schools': PlanScope.SCHOOL
  };

  for (const [category, scope] of Object.entries(categoryToScope)) {
    const result = await prisma.subscriptionPlan.updateMany({
      where: {
        category: { equals: category, mode: 'insensitive' },
        planScope: { not: scope }
      },
      data: {
        planScope: scope
      }
    });
    console.log(`Updated ${result.count} plans in category "${category}" to scope "${scope}"`);
  }

  console.log('Plan scope correction completed.');
}

fixPlanScopes()
  .catch(e => console.error('Error during correction:', e))
  .finally(() => prisma.$disconnect());
