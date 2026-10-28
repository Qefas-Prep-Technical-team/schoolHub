const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addProfileCols() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "platform_staff" 
      ADD COLUMN IF NOT EXISTS "profileImage" TEXT,
      ADD COLUMN IF NOT EXISTS "phone" TEXT,
      ADD COLUMN IF NOT EXISTS "bio" TEXT,
      ADD COLUMN IF NOT EXISTS "githubId" TEXT,
      ADD COLUMN IF NOT EXISTS "linkedinId" TEXT,
      ADD COLUMN IF NOT EXISTS "twitterId" TEXT,
      ADD COLUMN IF NOT EXISTS "socialLinks" JSONB DEFAULT '{}'::jsonb;
    `);
    console.log('Successfully upgraded platform_staff table with profileImage, phone, bio, and social login columns!');
  } catch (err) {
    console.error('Error adding columns:', err);
  } finally {
    await prisma.$disconnect();
  }
}

addProfileCols();
