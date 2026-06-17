import prisma from "../config/database";

async function run() {
  try {
    const teachers = await prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        teacherCode: true,
        activeSchoolId: true,
        primarySchoolId: true,
        teacherSubjects: {
          select: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              }
            }
          }
        },
        classTeachers: {
          select: {
            class: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });
    console.log("=== TEACHERS IN DATABASE ===");
    console.log(JSON.stringify(teachers, null, 2));

    const allSubjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        schoolId: true,
        teacherId: true,
      }
    });
    console.log("=== ALL SUBJECTS IN DATABASE ===");
    console.log(JSON.stringify(allSubjects, null, 2));

  } catch (error) {
    console.error("Error querying database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
