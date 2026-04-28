import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- FINAL VERIFICATION START ---');

  // 1. Verify Plans (Trial Status)
  const institutionalStarter = await prisma.subscriptionPlan.findFirst({
    where: { category: 'schools', type: 'starter' }
  });
  
  if (institutionalStarter) {
    console.log('Institutional Starter Plan:');
    console.log(' - Name:', institutionalStarter.name);
    console.log(' - hasTrial:', institutionalStarter.hasTrial);
    console.log(' - trialDays:', institutionalStarter.trialDays);
    if (institutionalStarter.hasTrial === true && institutionalStarter.trialDays > 0) {
      console.log(' ✅ Trial status correctly set.');
    } else {
      console.log(' ❌ Trial status INCORRECT.');
    }
  } else {
    console.log(' ❌ Institutional Starter Plan not found!');
  }

  // 2. Verify School Lookup (by tenantId)
  const firstSchool = await prisma.school.findFirst();
  if (firstSchool) {
    const testId = firstSchool.tenantId;
    console.log(`Testing lookup for school "${firstSchool.name}" using tenantId: "${testId}"`);
    
    const foundSchool = await prisma.school.findFirst({
      where: {
        OR: [
          { id: testId },
          { tenantId: testId }
        ]
      }
    });

    if (foundSchool && foundSchool.name === firstSchool.name) {
      console.log(' ✅ School lookup by tenantId successful.');
    } else {
      console.log(' ❌ School lookup by tenantId FAILED.');
    }
  } else {
    console.log(' ❌ No schools found in database to test lookup.');
  }

  console.log('--- FINAL VERIFICATION END ---');
}

main()
  .catch((e) => {
    console.error('VERIFICATION CRASHED:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
