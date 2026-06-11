const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const classTeachers = await prisma.classTeacher.findMany({
    include: { class: true }
  });
  console.log(classTeachers);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
