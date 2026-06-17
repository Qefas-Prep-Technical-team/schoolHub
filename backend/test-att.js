const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findFirst({
    include: { attendances: true }
  });
  console.log("Student:", student.id);
  console.log("Attendances:", student.attendances.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
