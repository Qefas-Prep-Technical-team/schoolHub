import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const teachers = await prisma.teacher.findMany({ take: 1 });
  if (!teachers.length) {
    console.log("No teachers found");
    return;
  }
  const tId = teachers[0].id;
  const teacher = await prisma.teacher.findUnique({
    where: { id: tId },
    include: { teacherSubjects: true }
  });
  console.log("Teacher:", teacher?.id, teacher?.name);
  
  if(!teacher) return;

  const subjectIds = teacher.teacherSubjects.map((ts: any) => ts.subjectId);
  const schoolId = teacher.activeSchoolId || teacher.primarySchoolId || teacher.schoolId;
  console.log("SubjectIds:", subjectIds);
  console.log("SchoolId:", schoolId);

  const periods = await prisma.timetablePeriod.findMany({
    where: {
      OR: [
        { teacherId: tId },
        {
          teacherId: null,
          subjectId: { in: subjectIds },
          class: { schoolId }
        },
        {
          isBreak: true,
          class: { schoolId }
        }
      ]
    },
    include: {
      subject: true,
      class: true,
    }
  });
  
  console.log("Periods found:", periods.length);
  if (periods.length > 0) {
    console.log("First period:", periods[0].day, periods[0].startTime, periods[0].subject?.name);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
