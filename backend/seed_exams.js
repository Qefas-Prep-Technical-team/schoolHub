const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const link = await prisma.parentChildLink.findFirst({
    where: { status: 'active' },
    include: { student: { include: { classes: { include: { class: true } } } } }
  });

  if (!link) {
    console.log("No active parent-child link found.");
    return;
  }

  const studentId = link.studentId;
  const classId = link.student.classes[0]?.class?.id;
  const schoolId = link.student.schoolId;

  const session = await prisma.session.findFirst({ where: { schoolId } });

  if (!classId || !session) {
    console.log("Student has no class or no session.");
    return;
  }

  console.log("Seeding data for Student ID:", studentId, "Class ID:", classId);

  // 1. Create Upcoming Exams
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.exam.create({
    data: {
      title: 'Upcoming Math Final',
      category: 'EXAM',
      status: 'PUBLISHED',
      mode: 'SINGLE_SUBJECT',
      schoolId: schoolId,
      classId: classId,
      sessionId: session.id,
      scope: 'CLASS',
      totalMarks: 100,
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // +2 hrs
      durationMinutes: 120,
    }
  });

  await prisma.exam.create({
    data: {
      title: 'Upcoming Science Project',
      category: 'EXAM',
      status: 'PUBLISHED',
      mode: 'COMBINED',
      schoolId: schoolId,
      classId: classId,
      sessionId: session.id,
      scope: 'CLASS',
      totalMarks: 50,
      startDate: nextWeek,
      endDate: new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000),
      durationMinutes: 60,
    }
  });

  // 2. Create Published Grades
  const pastExam = await prisma.exam.create({
    data: {
      title: 'Past English Midterm',
      category: 'EXAM',
      status: 'PUBLISHED',
      mode: 'SINGLE_SUBJECT',
      schoolId: schoolId,
      classId: classId,
      sessionId: session.id,
      scope: 'CLASS',
      totalMarks: 100,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
    }
  });

  await prisma.grade.create({
    data: {
      studentId: studentId,
      schoolId: schoolId,
      examId: pastExam.id,
      score: 85,
      maxMarks: 100,
      subject: 'English',
      status: 'PUBLISHED',
      term: 'FIRST',
    }
  });

  const pastExam2 = await prisma.exam.create({
    data: {
      title: 'Past Physics Quiz',
      category: 'EXAM',
      status: 'PUBLISHED',
      mode: 'SINGLE_SUBJECT',
      schoolId: schoolId,
      classId: classId,
      sessionId: session.id,
      scope: 'CLASS',
      totalMarks: 50,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    }
  });

  await prisma.grade.create({
    data: {
      studentId: studentId,
      schoolId: schoolId,
      examId: pastExam2.id,
      score: 45,
      maxMarks: 50,
      subject: 'Physics',
      status: 'PUBLISHED',
      term: 'FIRST',
    }
  });

  console.log("Seeding complete!");
}

seed().catch(console.error).finally(() => prisma.$disconnect());
