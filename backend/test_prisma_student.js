const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findUnique({
    where: { id: 'f7eeef6b-73b2-4d22-b5bc-0cf7366d8b39' },
  });
  console.log("Student:", student);
}

main().finally(() => prisma.$disconnect());
