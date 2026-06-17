const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const link = await prisma.parentChildLink.findFirst({
    where: { status: 'active' },
  });
  
  const student = await prisma.student.findUnique({
    where: { id: link.studentId },
    include: {
      grades: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          exam: true,
          subjectPaper: {
            include: {
              subject: true,
            }
          },
        },
      },
    }
  });
  
  console.log("Student Grades:", JSON.stringify(student.grades, null, 2));
}
test().finally(() => prisma.$disconnect());
