import prisma from "../src/config/database";

async function testStats() {
  console.log("Starting DB Stats verification...");
  try {
    console.log("1. Querying schoolCount...");
    const schoolCount = await prisma.school.count();
    console.log("schoolCount:", schoolCount);

    console.log("2. Querying activeSchoolCount...");
    const activeSchoolCount = await prisma.school.count({ where: { subscriptionStatus: 'ACTIVE' } });
    console.log("activeSchoolCount:", activeSchoolCount);

    console.log("3. Querying studentCount...");
    const studentCount = await prisma.student.count();
    console.log("studentCount:", studentCount);

    console.log("4. Querying teacherCount...");
    const teacherCount = await prisma.teacher.count();
    console.log("teacherCount:", teacherCount);

    console.log("5. Querying parentCount...");
    const parentCount = await prisma.parent.count();
    console.log("parentCount:", parentCount);

    console.log("6. Querying adminCount...");
    const adminCount = await prisma.admin.count();
    console.log("adminCount:", adminCount);

    console.log("7. Querying transactionHistory for recentRevenue...");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRevenue = await prisma.transactionHistory.aggregate({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: {
        amount: true
      }
    });
    console.log("recentRevenue:", recentRevenue);

    console.log("8. Querying transactionHistory for totalRevenue...");
    const totalRevenue = await prisma.transactionHistory.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true }
    });
    console.log("totalRevenue:", totalRevenue);

    console.log("9. Querying fileMetric for storageUsage...");
    const storageUsage = await prisma.fileMetric.aggregate({
      _sum: { fileSize: true }
    });
    console.log("storageUsage:", storageUsage);

    console.log("All queries completed successfully!");
  } catch (error: any) {
    console.error("CRITICAL ERROR during query execution:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testStats();
