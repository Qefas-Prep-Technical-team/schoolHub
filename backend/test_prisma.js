const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const students = await prisma.student.findMany({
      where: { schoolId: 'a3d699e1-6385-485e-bc5d-85ce01cd3f2e' },
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
    console.log(JSON.stringify(students, null, 2));
  } catch (error) {
    console.error("Prisma error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
