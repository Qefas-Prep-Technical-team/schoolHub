const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findUnique({
    where: { id: "09cf7e18-636c-4ec7-b8ab-fc2a41249b6b" },
    include: { attendances: true }
  });
  console.log("Attendances for student:", student.attendances.length);
  if (student.attendances.length > 0) {
    console.log("Status:", student.attendances[0].status);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
