const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({
    where: { schoolId: 'cbef052a-277c-4987-906c-7e8a41c9ed5e' },
    take: 1000,
    select: {
      id: true,
      name: true,
      email: true,
      studentCode: true,
      authProvider: true,
      verified: true,
      profileImage: true,
      gender: true,
      classes: {
        include: {
          class: true
        }
      },
      department: true
    },
    orderBy: { name: 'asc' }
  });
  console.log("Found students length:", students.length);
}

main().finally(() => prisma.$disconnect());
