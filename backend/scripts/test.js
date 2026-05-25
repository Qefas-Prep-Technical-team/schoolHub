const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const teachers = await prisma.teacher.findMany({ select: { id: true, name: true, email: true } });
  console.log("ALL TEACHERS:", teachers);
}
main().finally(() => prisma.$disconnect());
