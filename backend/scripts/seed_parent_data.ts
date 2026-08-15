import { PrismaClient, GradeStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function seedData() {
  const parents = await prisma.parent.findMany({
    include: { children: { include: { student: true } } }
  });

  if (parents.length === 0) {
    console.log("No parents found");
    return;
  }

  for (const parent of parents) {
    if (parent.children.length > 0) {
      const student = parent.children[0].student;
      const schoolId = student.schoolId;
      
      if (!schoolId) {
          console.log(`Student ${student.name} has no schoolId, skipping...`);
          continue;
      }
      
      console.log(`Seeding data for student ${student.name} (Parent: ${parent.fullName})`);

      // 1. Seed Attendances
      const enrollments = await prisma.classEnrollment.findMany({ where: { studentId: student.id } });
      let classId = enrollments[0]?.classId;
      
      if (!classId) {
         const firstClass = await prisma.class.findFirst({ where: { schoolId } });
         if (firstClass) {
            classId = firstClass.id;
            await prisma.classEnrollment.create({ data: { studentId: student.id, classId } });
         } else {
             const dummyClass = await prisma.class.create({ data: { name: "Grade 10", classCode: "G10-" + Math.random(), scope: "SCHOOL", schoolId, status: "APPROVED" }});
             classId = dummyClass.id;
             await prisma.classEnrollment.create({ data: { studentId: student.id, classId } });
         }
      }

      for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateObj = new Date(date.toISOString().split('T')[0] + 'T00:00:00.000Z');
        
        await prisma.attendance.upsert({
          where: {
            classId_studentId_date: {
              classId,
              studentId: student.id,
              date: dateObj
            }
          },
          update: {},
          create: {
            classId,
            studentId: student.id,
            date: dateObj,
            status: i % 10 === 0 ? "absent" : "present" // 90% attendance
          }
        });
      }

      // 2. Seed Grades
      const subjects = ["Mathematics", "Science", "English", "History", "Physics"];
      for (const sub of subjects) {
         await prisma.grade.create({
            data: {
               studentId: student.id,
               schoolId,
               classId,
               subject: sub,
               score: Math.floor(Math.random() * 30) + 70, // 70-100
               maxMarks: 100,
               status: GradeStatus.PUBLISHED,
            }
         });
      }
      
      console.log("Seeded successfully for parent: " + parent.fullName);
    }
  }
}

seedData().catch(console.error).finally(() => prisma.$disconnect());
