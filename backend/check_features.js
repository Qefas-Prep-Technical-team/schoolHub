const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const features = await prisma.platformFeature.findMany();
    console.log('Features count:', features.length);
    console.log('Sample features:', JSON.stringify(features.slice(0, 2), null, 2));
  } catch (error) {
    console.error('Error fetching features:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
