const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: '94552fe1-679f-4c0e-8894-ffb09e54e9f1' },
    include: {
      assignment: {
        include: {
          department: true
        }
      }
    }
  });
  console.log('SUBMISSION DETAILS:', JSON.stringify(submission, null, 2));

  if (submission && submission.assignment) {
    const subject = await prisma.subject.findUnique({
      where: { id: submission.assignment.subjectId }
    });
    console.log('SUBJECT DETAILS:', JSON.stringify(subject, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
