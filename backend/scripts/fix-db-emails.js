const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teachers = await prisma.teacher.findMany();
  let updatedCount = 0;
  for (const t of teachers) {
    if (t.email !== t.email.toLowerCase()) {
      await prisma.teacher.update({
        where: { id: t.id },
        data: { email: t.email.toLowerCase().trim() }
      });
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} teacher emails to lowercase.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
