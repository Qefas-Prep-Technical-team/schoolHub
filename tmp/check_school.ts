import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSchool(id: string) {
  try {
    const school = await prisma.school.findUnique({ where: { id } });
    console.log('School:', school ? `Found: ${school.name}` : 'Not found');
    
    const settings = await prisma.schoolSetting.findUnique({ where: { schoolId: id } });
    console.log('Settings:', settings ? 'Found' : 'Not found');
  } catch (error) {
    console.error('Error checking school:', error);
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
