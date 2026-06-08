import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting backfill of missing assignment grades...');

  // Fetch GRADED submissions with their assignment
  const submissions = await prisma.assignmentSubmission.findMany({
    where: {
      status: 'GRADED',
      score: { not: null },
    },
    include: {
      assignment: true,
    }
  });

  console.log(`Found ${submissions.length} GRADED submission(s). Checking for missing Grade records...`);

  // Pre-fetch all subjects needed
  const subjectIds = [...new Set(submissions.map(s => s.assignment.subjectId))];
  const subjects = await prisma.subject.findMany({
    where: { id: { in: subjectIds } },
    select: { id: true, name: true }
  });
  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s.name]));

  // Pre-fetch all teacherIds that actually exist in the Teacher table
  const teacherIds = [...new Set(submissions.map(s => s.assignment.teacherId).filter(Boolean))] as string[];
  const validTeachers = await prisma.teacher.findMany({
    where: { id: { in: teacherIds } },
    select: { id: true }
  });
  const validTeacherSet = new Set(validTeachers.map(t => t.id));

  let added = 0;
  let skipped = 0;

  for (const sub of submissions) {
    const gradeId = `grade-assignment-${sub.id}`;
    
    const existingGrade = await prisma.grade.findUnique({
      where: { id: gradeId }
    });

    if (!existingGrade) {
      const teacherId = validTeacherSet.has(sub.assignment.teacherId) ? sub.assignment.teacherId : null;
      console.log(`Creating grade for submission ${sub.id} (assignment: "${sub.assignment.title}", score: ${sub.score}/${sub.assignment.totalMarks})`);
      
      try {
        await prisma.grade.create({
          data: {
            id: gradeId,
            studentId: sub.studentId,
            schoolId: sub.assignment.schoolId,
            teacherId,
            classId: sub.assignment.classId,
            subject: subjectMap[sub.assignment.subjectId] || 'Assignment',
            assessmentType: 'ASSIGNMENT',
            score: sub.score!,
            maxMarks: sub.assignment.totalMarks,
            remarks: sub.assignment.title,
          }
        });
        added++;
      } catch (err: any) {
        console.error(`  Failed for submission ${sub.id}: ${err.message}`);
        skipped++;
      }
    }
  }

  console.log(`\nBackfill complete. Added: ${added}, Skipped/Failed: ${skipped}.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
