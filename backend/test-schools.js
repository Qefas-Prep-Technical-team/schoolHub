const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const studentId = "44d90c45-2853-477c-b3d3-f07719d7ac76";
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      school: true,
      originalSchool: true,
      enrollments: { include: { class: { include: { school: true } } } },
      histories: { include: { school: true } }
    }
  });

  console.log("Current School:", student.school?.name);
  console.log("Original School:", student.originalSchool?.name);
  console.log("Enrollment Schools:", student.enrollments.map(e => e.class.school?.name));
  console.log("History Schools:", [...new Set(student.histories.map(h => h.school?.name).filter(Boolean))]);
}

check().catch(console.error).finally(() => prisma.$disconnect());
