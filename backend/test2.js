const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const grades = await prisma.grade.findMany({
    select: { assessmentType: true, category: true, id: true, remarks: true }
  });
  
  const types = new Set();
  grades.forEach(g => {
     types.add(g.assessmentType);
     if(g.remarks && g.remarks.toLowerCase().includes('assignment')) {
        console.log("Found grade with assignment in remarks:", g);
     }
  });
  console.log("Unique assessment types:", Array.from(types));
  
  const submissions = await prisma.assignmentSubmission.findMany({
     include: { assignment: true }
  });
  console.log("Total assignment submissions:", submissions.length);
  const gradedSubmissions = submissions.filter(s => s.status === 'GRADED');
  console.log("Total GRADED assignment submissions:", gradedSubmissions.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
