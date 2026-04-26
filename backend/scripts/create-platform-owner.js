const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@schoolhub.ops';
  const password = 'Password123'; // Simplified password
  const fullName = 'Platform Owner';

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const staff = await prisma.platformStaff.upsert({
      where: { email },
      update: {
        password: hashedPassword,
      },
      create: {
        email,
        password: hashedPassword,
        fullName,
        role: 'OWNER',
      },
    });

    console.log('Initial Platform Owner created (or updated) successfully:', staff.email);
  } catch (error) {
    console.error('Failed to create/update Platform Owner:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
