const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.schoolAdmin.findMany({
    include: { admin: true }
  });
  console.log("Admins:", JSON.stringify(admins, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
