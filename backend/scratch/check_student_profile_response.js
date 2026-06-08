const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Simulate the student service query for a student profile
  const student = await prisma.student.findUnique({
    where: { email: 'finixd531@gmail.com' },
    include: {
      classes: {
        include: {
          class: {
            include: {
              subjects: {
                include: {
                  subject: true
                }
              }
            }
          }
        }
      },
      department: {
        include: {
          subjects: {
            include: {
              subject: true
            }
          }
        }
      },
      school: true
    }
  });

  console.log('--- PROFILE FIELDS ---');
  if (student) {
    console.log('Class Subjects count:', student.classes[0]?.class?.subjects?.length);
    console.log('Department Subjects count:', student.department?.subjects?.length);
    console.log('Department name:', student.department?.name);
    console.log('Department subjects:', student.department?.subjects.map(s => s.subject.name));
  } else {
    console.log('Student not found');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
