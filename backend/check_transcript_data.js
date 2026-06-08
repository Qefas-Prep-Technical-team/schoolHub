const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all students
  const students = await prisma.student.findMany({
    include: {
      classes: {
        include: {
          class: true
        }
      },
      department: true
    }
  });
  console.log(`Found ${students.length} students`);
  for (const s of students) {
    console.log(`Student: ${s.name} (${s.email}), classIds: ${s.classes.map(c => c.classId).join(', ')}, dept: ${s.department?.name || 'N/A'}`);
  }

  // Find all grades
  const grades = await prisma.grade.findMany({
    include: {
      student: { select: { name: true } }
    }
  });
  console.log(`\nFound ${grades.length} grades:`);
  for (const g of grades) {
    console.log(`Grade: ID=${g.id}, Student=${g.student?.name}, Subject=${g.subject}, Score=${g.score}/${g.maxMarks}, Type=${g.assessmentType}, Remarks=${g.remarks}`);
  }

  // Find all exam attempts
  const attempts = await prisma.examAttempt.findMany({
    include: {
      student: { select: { name: true } },
      exam: true
    }
  });
  console.log(`\nFound ${attempts.length} exam attempts:`);
  for (const a of attempts) {
    console.log(`Attempt: ID=${a.id}, Student=${a.student?.name}, Exam=${a.exam.title}`);
  }

  // Find all subject exam papers
  const papers = await prisma.subjectExamPaper.findMany({
    include: {
      subject: true
    }
  });
  console.log(`\nFound ${papers.length} subject exam papers:`);
  for (const p of papers) {
    console.log(`Paper: ID=${p.id}, Title=${p.title}, Subject=${p.subject?.name || 'N/A'}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
