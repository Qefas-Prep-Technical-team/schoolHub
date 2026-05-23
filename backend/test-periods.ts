import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const school = await prisma.school.findFirst();
  if (!school) return console.log("No school");
  console.log("School:", school.id, school.name);
  
  const periods = await prisma.timetablePeriod.findMany({
    where: { class: { schoolId: school.id } },
    include: { subject: true, teacher: true }
  });
  
  console.log("Total periods in school:", periods.length);
  periods.forEach(p => {
    console.log(`- Day: ${p.day}, Time: ${p.startTime}, Subject: ${p.subject?.name}, TeacherId: ${p.teacherId}, TermPeriodId: ${p.termPeriodId}, isBreak: ${p.isBreak}`);
  });
  
  const teacher = await prisma.teacher.findUnique({
    where: { id: "33736208-f6bd-4f08-90f3-ec20bfcd3681" },
    include: { teacherSubjects: { include: { subject: true } } }
  });
  console.log("Teacher subject IDs:");
  teacher?.teacherSubjects.forEach(ts => {
    console.log(` - ${ts.subjectId} (${ts.subject?.name})`);
  });
}

run().finally(() => prisma.$disconnect());
