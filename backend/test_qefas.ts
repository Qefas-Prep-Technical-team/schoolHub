import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.findUnique({
    where: { subdomain: 'qefas' }
  });
  console.log(school);
  
  if (school) {
    const landingPage = await prisma.schoolLandingPage.findUnique({
      where: { schoolId: school.id }
    });
    console.log("Landing page exists:", !!landingPage);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
