import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB cleanup...');
  try {
    const plans = await prisma.subscriptionPlan.findMany({ select: { id: true } });
    const planIds = plans.map(p => p.id);
    console.log(`Found ${planIds.length} valid plans.`);

    const schoolResult = await prisma.school.updateMany({
      where: {
        subscriptionPlanId: { notIn: planIds, not: null }
      },
      data: { subscriptionPlanId: null }
    });
    console.log(`Updated ${schoolResult.count} schools.`);

    const adminResult = await prisma.admin.updateMany({
      where: {
        subscriptionPlanId: { notIn: planIds, not: null }
      },
      data: { subscriptionPlanId: null }
    });
    console.log(`Updated ${adminResult.count} admins.`);

    const teacherResult = await prisma.teacher.updateMany({
      where: {
        subscriptionPlanId: { notIn: planIds, not: null }
      },
      data: { subscriptionPlanId: null }
    });
    console.log(`Updated ${teacherResult.count} teachers.`);

    const studentResult = await prisma.student.updateMany({
      where: {
        subscriptionPlanId: { notIn: planIds, not: null }
      },
      data: { subscriptionPlanId: null }
    });
    console.log(`Updated ${studentResult.count} students.`);

    const parentResult = await prisma.parent.updateMany({
      where: {
        subscriptionPlanId: { notIn: planIds, not: null }
      },
      data: { subscriptionPlanId: null }
    });
    console.log(`Updated ${parentResult.count} parents.`);

    // --- School Relation Cleanup ---
    const schools = await prisma.school.findMany({ select: { id: true } });
    const schoolIds = schools.map(s => s.id);
    console.log(`Found ${schoolIds.length} valid schools.`);

    const teacherSchoolResult = await prisma.teacher.updateMany({
      where: {
        OR: [
          { currentSchoolId: { notIn: schoolIds, not: null } },
          { primarySchoolId: { notIn: schoolIds, not: null } },
          { schoolId: { notIn: schoolIds, not: null } }
        ]
      },
      data: {
        // We can't selectively nullify in updateMany, so we'll do individual passes or just nullify everything if not careful.
        // Actually, updateMany with OR might be risky if we only want to nullify the INVALID one.
      }
    });
    
    // Better to do individual passes
    const t1 = await prisma.teacher.updateMany({
      where: { currentSchoolId: { notIn: schoolIds, not: null } },
      data: { currentSchoolId: null }
    });
    const t2 = await prisma.teacher.updateMany({
      where: { primarySchoolId: { notIn: schoolIds, not: null } },
      data: { primarySchoolId: null }
    });
    const t3 = await prisma.teacher.updateMany({
      where: { schoolId: { notIn: schoolIds, not: null } },
      data: { schoolId: null }
    });
    console.log(`Cleaned up teacher school relations: ${t1.count}, ${t2.count}, ${t3.count}`);

    const s1 = await prisma.student.updateMany({
      where: { originalSchoolId: { notIn: schoolIds, not: null } },
      data: { originalSchoolId: null }
    });
    const s2 = await prisma.student.updateMany({
      where: { schoolId: { notIn: schoolIds, not: null } },
      data: { schoolId: null }
    });
    console.log(`Cleaned up student school relations: ${s1.count}, ${s2.count}`);

  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
