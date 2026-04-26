const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@schoolhub.ops';
  const password = 'Password123';

  console.log('--- Platform Staff Debug ---');
  const staff = await prisma.platformStaff.findUnique({
    where: { email },
  });

  if (!staff) {
    console.error('❌ Staff record NOT found in database!');
    return;
  }

  console.log('✅ Staff record found.');
  console.log('ID:', staff.id);
  console.log('Email:', staff.email);
  console.log('Active:', staff.isActive);
  console.log('Role:', staff.role);

  const isMatch = await bcrypt.compare(password, staff.password);
  console.log('Password Match Test:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
