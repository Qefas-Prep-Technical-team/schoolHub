import { PrismaClient, PlanScope } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding subscription plans...");

  const plans = [
    // SCHOOL PLANS
    {
      name: "Free School Plan",
      planScope: PlanScope.SCHOOL,
      type: "free",
      category: "schools",
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxStudents: 50,
      maxExams: 10,
      maxClasses: 5,
      maxTeachers: 5,
      maxParents: 100,
      maxStorageGb: 1,
      features: ["basic_analytics", "student_management"],
    },
    {
      name: "Pro School Plan",
      planScope: PlanScope.SCHOOL,
      type: "pro",
      category: "schools",
      monthlyPrice: 50000,
      yearlyPrice: 500000,
      maxStudents: 1000,
      maxExams: 500,
      maxClasses: 50,
      maxTeachers: 100,
      maxParents: 2000,
      maxStorageGb: 50,
      features: ["advanced_analytics", "ai_tools", "exam_proctoring", "unlimited_classes"],
    },
    // TEACHER PLANS
    {
      name: "Teacher Basic",
      planScope: PlanScope.TEACHER,
      type: "free",
      category: "teachers",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: ["subject_management", "basic_grading"],
    },
    {
      name: "Teacher Premium",
      planScope: PlanScope.TEACHER,
      type: "premium",
      category: "teachers",
      monthlyPrice: 2000,
      yearlyPrice: 20000,
      features: ["ai_lesson_planner", "advanced_analytics", "ai_tools"],
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { category_type: { category: plan.category, type: plan.type } },
      update: plan,
      create: plan,
    });
  }

  console.log("Seeding completed.");

  // Auto-initialize existing schools that don't have a subscription yet
  const schoolsWithoutSub = await prisma.school.findMany({
    where: {
      schoolSubscriptions: { is: null }
    }
  });

  console.log(`Found ${schoolsWithoutSub.length} schools without subscriptions. Initializing...`);

  const freeSchoolPlan = await prisma.subscriptionPlan.findFirst({
    where: { planScope: PlanScope.SCHOOL, type: "free" }
  });

  if (freeSchoolPlan) {
    for (const school of schoolsWithoutSub) {
      await prisma.schoolSubscription.create({
        data: {
          schoolId: school.id,
          subscriptionPlanId: freeSchoolPlan.id,
          subscriptionType: "FREE",
          status: "ACTIVE",
        }
      });
      console.log(`Initialized ${school.name} with free plan.`);
    }
  }
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
