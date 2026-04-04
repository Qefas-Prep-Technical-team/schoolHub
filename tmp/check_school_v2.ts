import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchool(id: string) {
  try {
    const school = await prisma.school.findUnique({ where: { id } });
    console.log('--- Checking School ID:', id);
    console.log('School Record:', school ? `Found: "${school.name}"` : 'NOT FOUND');
    
    if (school) {
        const settings = await prisma.schoolSetting.findUnique({ where: { schoolId: id } });
        console.log('Settings Record:', settings ? 'Found' : 'Not found');
    } else {
        const schools = await prisma.school.findMany({ take: 5 });
        console.log('First 5 schools in DB:', schools.map(s => `${s.name} (${s.id})`));
    }
  } catch (error) {
    console.error('Error during DB check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const id = process.argv[2];
if (id) {
  checkSchool(id);
} else {
  console.log('No schoolId provided');
}
