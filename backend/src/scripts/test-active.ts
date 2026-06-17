import prisma from '../config/database';

async function makeActive() {
  console.log("🔍 Fetching Qefas Prep School to restore active status...");
  
  const school = await prisma.school.findFirst({
    where: {
      name: { contains: 'Qefas Prep School' }
    }
  });

  if (!school) {
    console.log("❌ Qefas Prep School not found.");
    return;
  }

  // Set expiration date to 30 days in the future
  const thirtyDaysFuture = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.school.update({
    where: { id: school.id },
    data: {
      subscriptionStatus: 'ACTIVE',
      subscriptionEnd: thirtyDaysFuture,
      plan: 'STARTER'
    }
  });

  console.log(`✅ Restored active school: ${school.name}`);
  console.log(`Current Status: ACTIVE, Plan: STARTER`);
  console.log(`⏳ Set subscriptionEnd to: ${thirtyDaysFuture.toISOString()} (30 Days in the future)`);
  console.log(`\n🚀 READY!`);
}

makeActive()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
