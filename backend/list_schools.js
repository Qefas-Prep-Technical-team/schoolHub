const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const schools = await prisma.school.findMany({
    include: {
      admins: true,
      students: true,
      classes: true
    }
  });

  console.log("Schools list:");
  for (const s of schools) {
    console.log(`- School: ${s.name} (${s.id})`);
    console.log(`  Admins count: ${s.admins.length}`);
    console.log(`  Students count: ${s.students.length}`);
    console.log(`  Classes count: ${s.classes.length}`);
  }
}

main().catch(err => {
  console.error(err);
}).finally(() => {
  prisma.$disconnect();
});
