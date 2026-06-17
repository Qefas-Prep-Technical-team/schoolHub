import prisma from '../config/database';

async function testExpiration() {
  console.log("🔍 Fetching an active school to test expiration...");
  
  // Find a school that is currently ACTIVE
  const school = await prisma.school.findFirst({
    where: {
      subscriptionStatus: 'ACTIVE'
    }
  });

  if (!school) {
    console.log("❌ No active school found in the database. Please ensure there is at least one active school.");
    return;
  }

  console.log(`✅ Found active school: ${school.name} (ID: ${school.id})`);
  console.log(`Current Status: ${school.subscriptionStatus}, Plan: ${school.plan}`);

  // Set expiration date to 1 hour ago
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  await prisma.school.update({
    where: { id: school.id },
    data: {
      subscriptionEnd: oneHourAgo
    }
  });

  console.log(`\n⏳ Set subscriptionEnd to: ${oneHourAgo.toISOString()} (In the past)`);
  console.log(`⚠️ Note: The subscriptionStatus is STILL 'ACTIVE' in the database.`);
  console.log(`\n🚀 TEST READY!`);
  console.log(`To test the JIT Invalidator: Simply refresh your dashboard in the browser right now.`);
  console.log(`You should see the limits drop, the UI turn to Expired, and receive a notification!`);
}

testExpiration()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
