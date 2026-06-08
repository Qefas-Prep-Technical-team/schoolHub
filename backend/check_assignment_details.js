const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assignment = await prisma.assignment.findUnique({
    where: { id: '94552fe1-679f-4c0e-8894-ffb09e54e9f1' },
    include: {
      department: true
    }
  });
  console.log('ASSIGNMENT DETAILS:', JSON.stringify(assignment, null, 2));

  if (assignment) {
    const subject = await prisma.subject.findUnique({
      where: { id: assignment.subjectId }
    });
    console.log('SUBJECT DETAILS:', JSON.stringify(subject, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
