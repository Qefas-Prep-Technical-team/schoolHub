import prisma from "../config/database";

async function run() {
  const teacherId = "28f8bf7a-821d-4eee-b00d-4e15350ea3a0";
  const schoolId = "cbef052a-277c-4987-906c-7e8a41c9ed5e";

  try {
    const subjects = await prisma.subject.findMany({
        where: {
            schoolId,
            isArchived: false,
            OR: [
                { teacherId },
                { teacherSubjects: { some: { teacherId } } },
                { classes: { some: { class: { teachers: { some: { teacherId } } } } } }
            ]
        },
        include: {
            teacher: {
                select: { name: true, id: true }
            }
        },
        orderBy: { name: 'asc' }
    });

    console.log("=== FOUND SUBJECTS USING MODIFIED QUERY ===");
    console.log(JSON.stringify(subjects, null, 2));
  } catch (error) {
    console.error("Error running query:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
