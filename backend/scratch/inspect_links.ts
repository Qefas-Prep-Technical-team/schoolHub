import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkLinks() {
  try {
    const links = await prisma.relationshipLink.findMany({
      where: { linkType: 'SCHOOL_TEACHER' },
      take: 10
    });
    console.log('--- SCHOOL_TEACHER LINKS ---');
    console.log(JSON.stringify(links, null, 2));

    const teachers = await prisma.teacher.findMany({
      take: 5,
      select: { id: true, name: true, schoolId: true, currentSchoolId: true }
    });
    console.log('\n--- TEACHERS ---');
    console.log(JSON.stringify(teachers, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkLinks();
