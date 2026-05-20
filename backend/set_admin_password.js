const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'testschool1@test.com';
  const plainPassword = 'Password123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const updatedAdmin = await prisma.admin.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log(`✅ Reset password for admin ${email} to "${plainPassword}" successfully!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
