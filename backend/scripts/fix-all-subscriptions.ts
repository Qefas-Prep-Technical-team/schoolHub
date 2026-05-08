import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Fixing Subscriptions ---');

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  // 1. Update Schools
  const schoolUpdate = await prisma.school.updateMany({
    data: {
      plan: 'PRO',
      subscriptionEnd: oneYearFromNow,
      subscriptionStatus: 'ACTIVE',
      isTrialActive: false
    }
  });
  console.log(`Updated ${schoolUpdate.count} schools.`);

  // 2. Update Admins
  const adminUpdate = await prisma.admin.updateMany({
    data: {
      plan: 'PRO',
      subscriptionEnd: oneYearFromNow,
      subscriptionStatus: 'ACTIVE'
    }
  });
  console.log(`Updated ${adminUpdate.count} admins.`);

  // 3. Update Teachers
  const teacherUpdate = await prisma.teacher.updateMany({
    data: {
      plan: 'PRO',
      subscriptionEnd: oneYearFromNow,
      subscriptionStatus: 'ACTIVE'
    }
  });
  console.log(`Updated ${teacherUpdate.count} teachers.`);

  // 4. Update Students
  const studentUpdate = await prisma.student.updateMany({
    data: {
      plan: 'PRO',
      subscriptionEnd: oneYearFromNow,
      subscriptionStatus: 'ACTIVE'
    }
  });
  console.log(`Updated ${studentUpdate.count} students.`);

  // 5. Update Parents
  const parentUpdate = await prisma.parent.updateMany({
    data: {
      plan: 'PRO',
      subscriptionEnd: oneYearFromNow,
      subscriptionStatus: 'ACTIVE'
    }
  });
  console.log(`Updated ${parentUpdate.count} parents.`);

  console.log('--- Done ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
