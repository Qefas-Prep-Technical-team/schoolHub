import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const teachers = await prisma.teacher.findMany({
    include: {
      classTeachers: {
        include: {
          class: true
        }
      }
    }
  });

  console.log(JSON.stringify(teachers, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
