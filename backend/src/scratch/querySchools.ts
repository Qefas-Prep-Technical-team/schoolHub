import prisma from "../config/database";

async function run() {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        tenantId: true,
      }
    });
    console.log("=== SCHOOLS IN DATABASE ===");
    console.log(JSON.stringify(schools, null, 2));
  } catch (error) {
    console.error("Error querying schools:", error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
