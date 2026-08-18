const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stats = await prisma.studentExamAttempt.aggregate({
    _avg: { score: true }
  });
  console.log("Overall Avg Score DB:", stats._avg.score);

  const att = await prisma.attendanceRecord.aggregate({
    _avg: { status: true } // not right but whatever
  });
  console.log("Attendance DB:", att);
}
main().finally(() => prisma.$disconnect());
