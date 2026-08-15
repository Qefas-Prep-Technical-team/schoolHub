const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({
    select: { id: true, name: true, schoolId: true }
  });
  console.log("Students:", students);
  const schools = await prisma.school.findMany({
    select: { id: true, name: true }
  });
  console.log("Schools:", schools);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
