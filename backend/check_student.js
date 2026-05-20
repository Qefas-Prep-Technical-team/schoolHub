const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findUnique({
    where: { id: '442c485d-7ac4-4bcc-bc3f-04bd6a0138dd' },
    include: {
      classes: {
        include: {
          class: true
        }
      },
      behaviourProfile: true
    }
  });
  console.log('STUDENT:', JSON.stringify(student, null, 2));

  const alerts = await prisma.behaviourAlert.findMany({
    where: { studentId: '442c485d-7ac4-4bcc-bc3f-04bd6a0138dd' }
  });
  console.log('ALERTS:', JSON.stringify(alerts, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
