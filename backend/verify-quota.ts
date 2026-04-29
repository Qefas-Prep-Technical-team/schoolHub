import { getSchoolUsageService } from './src/modules/subscription/quota.service';
import prisma from './src/config/database';

async function verify() {
  const school = await prisma.school.findFirst();
  if (!school) {
    console.error("No school found");
    return;
  }

  console.log(`Verifying for school: ${school.name} (ID: ${school.id})`);
  const usageData = await getSchoolUsageService(school.id);
  console.log("Usage Data Result:");
  console.log(JSON.stringify(usageData, null, 2));
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
