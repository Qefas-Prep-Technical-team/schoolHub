const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const cols = await prisma.$queryRawUnsafe(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('PlatformStaff', 'platform_staff', 'Admin', 'admins')
      ORDER BY table_name, ordinal_position
    `);
    console.log('COLUMNS:', JSON.stringify(cols, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
