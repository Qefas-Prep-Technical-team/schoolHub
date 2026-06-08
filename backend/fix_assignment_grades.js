const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const grades = await prisma.grade.findMany({
    where: {
      OR: [
        { subject: 'Assignment' },
        { subject: 'ASSIGNMENT' },
        { assessmentType: 'ASSIGNMENT' }
      ]
    }
  });

  console.log(`Found ${grades.length} assignment-related grades to inspect.`);

  let updatedCount = 0;
  for (const grade of grades) {
    if (grade.id.startsWith('grade-assignment-')) {
      const submissionId = grade.id.replace('grade-assignment-', '');
      const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: {
          assignment: true
        }
      });

      if (submission && submission.assignment) {
        const subject = await prisma.subject.findUnique({
          where: { id: submission.assignment.subjectId }
        });

        if (subject) {
          if (grade.subject !== subject.name) {
            console.log(`Updating Grade ${grade.id}: subject '${grade.subject}' -> '${subject.name}'`);
            await prisma.grade.update({
              where: { id: grade.id },
              data: { subject: subject.name }
            });
            updatedCount++;
          } else {
            console.log(`Grade ${grade.id} already has correct subject name '${subject.name}'`);
          }
        } else {
          console.log(`Subject not found for subjectId ${submission.assignment.subjectId} (assignment: ${submission.assignment.title})`);
        }
      } else {
        console.log(`Submission/assignment not found for submission ID ${submissionId}`);
      }
    } else {
      console.log(`Grade ${grade.id} is assignment type but ID does not follow standard pattern.`);
    }
  }

  console.log(`Finished. Updated ${updatedCount} grade records.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
