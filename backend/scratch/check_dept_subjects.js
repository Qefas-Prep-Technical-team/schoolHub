const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dept = await prisma.department.findUnique({
    where: { id: '4238f480-68d1-4b91-8d55-b144ab3c3033' },
    include: {
      subjects: {
        include: {
          subject: true
        }
      }
    }
  });

  console.log('--- DEPARTMENT SUBJECTS ---');
  console.log(JSON.stringify(dept, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
