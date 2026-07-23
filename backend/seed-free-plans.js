const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      id: "bff5c416-3e41-4244-9ef6-84cf6d894fb8",
      name: "School Free Plan",
      category: "SCHOOL",
      type: "FREE",
      planScope: "SCHOOL",
      monthlyPrice: 0,
      description: "Default free plan for schools",
      features: ["Up to 100 students"],
      maxStudents: 100
    },
    {
      id: "c1d65715-1b73-45de-9666-5444e6176df6",
      name: "Teacher Free Plan",
      category: "TEACHER",
      type: "FREE",
      planScope: "TEACHER",
      monthlyPrice: 0,
      description: "Default free plan for teachers",
      features: ["Access to basic features"]
    },
    {
      id: "d0a35697-d893-4bc1-b5cd-dcdc909d841c",
      name: "Student Free Plan",
      category: "STUDENT",
      type: "FREE",
      planScope: "STUDENT",
      monthlyPrice: 0,
      description: "Default free plan for students",
      features: ["Access to classes"]
    },
    {
      id: "e8efff71-9f5e-4a5a-9ddd-c6dee8f826bd",
      name: "Parent Free Plan",
      category: "PARENT",
      type: "FREE",
      planScope: "PARENT",
      monthlyPrice: 0,
      description: "Default free plan for parents",
      features: ["Track student progress"]
    }
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: p.id },
      update: {},
      create: p
    });
  }
  console.log("Plans seeded successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    process.exit(0);
  });
