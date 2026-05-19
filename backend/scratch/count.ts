import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== DB COUNTS & LIMITS CHECK ===");
  
  // 1. Get all schools and their classes count
  const schools = await prisma.school.findMany({
    select: {
      id: true,
      name: true,
      plan: true,
      maxClassesOverride: true,
    }
  });

  for (const s of schools) {
    const classCount = await prisma.class.count({ where: { schoolId: s.id } });
    console.log(`School: ${s.name} (${s.id})`);
    console.log(`- Plan: ${s.plan}`);
    console.log(`- MaxClassesOverride: ${s.maxClassesOverride}`);
    console.log(`- Current Active Classes: ${classCount}`);
  }

  // 2. Get all teachers and their classTeacher count
  const teachers = await prisma.teacher.findMany({
    select: {
      id: true,
      name: true,
      plan: true,
      maxClassesOverride: true,
    }
  });

  for (const t of teachers) {
    const classCount = await prisma.classTeacher.count({ where: { teacherId: t.id } });
    console.log(`Teacher: ${t.name} (${t.id})`);
    console.log(`- Plan: ${t.plan}`);
    console.log(`- MaxClassesOverride: ${t.maxClassesOverride}`);
    console.log(`- Current Active Classes: ${classCount}`);
  }

  // 3. Get platformSettings for sub_enforced
  const settings = await prisma.platformSettings.findMany({
    where: {
      key: { startsWith: "sub_enforced" }
    }
  });
  console.log("Settings:");
  for (const set of settings) {
    console.log(`- ${set.key}: ${set.value}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
