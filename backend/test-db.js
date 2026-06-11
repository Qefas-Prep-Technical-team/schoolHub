const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const classTeacher = await prisma.classTeacher.findFirst({
      where: {
        teacherId: "123",
        classId: "123",
        class: {
          OR: [
            { schoolId: "123" },
            { schoolId: null }
          ]
        }
      },
      include: {
        teacher: true,
        class: true,
      }
    });
    console.log("Valid Prisma Query:", !!classTeacher);
  } catch (e) {
    console.error("PRISMA ERROR:", e.name, e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
