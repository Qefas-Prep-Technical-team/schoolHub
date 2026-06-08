const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findFirst({
    where: { email: 'finixd531@gmail.com' },
    include: {
      classes: {
        include: {
          class: true
        }
      },
      department: true
    }
  });

  if (!student) {
    console.log("Student finixd531@gmail.com not found");
    return;
  }

  console.log('--- STUDENT DETAILS ---');
  console.log(JSON.stringify(student, null, 2));

  console.log('\n--- STUDENT GRADES ---');
  const grades = await prisma.grade.findMany({
    where: { studentId: student.id }
  });
  console.log(JSON.stringify(grades, null, 2));

  console.log('\n--- STUDENT EXAM ATTEMPTS ---');
  const attempts = await prisma.examAttempt.findMany({
    where: { studentId: student.id },
    include: {
      exam: true
    }
  });
  console.log(JSON.stringify(attempts, null, 2));

  console.log('\n--- CLASS SUBJECTS & PAPERS ---');
  // Find subjects linked to this class or department
  if (student.classes.length > 0) {
    const classId = student.classes[0].classId;
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        subjects: {
          include: {
            subject: true
          }
        }
      }
    });
    console.log(JSON.stringify(classRecord, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
