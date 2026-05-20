const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminId = '172b060d-adae-467b-8101-67d754cef925';
  
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    include: {
      schoolAdmins: {
        include: {
          school: true
        }
      }
    }
  });

  console.log("Admin details:");
  console.log("ID:", admin.id);
  console.log("Email:", admin.email);
  console.log("School Admins Count:", admin.schoolAdmins.length);
  for (const sa of admin.schoolAdmins) {
    console.log(`- School Admin ID: ${sa.id}`);
    console.log(`  School ID: ${sa.schoolId}`);
    console.log(`  School Name: ${sa.school.name}`);
    console.log(`  Active: ${sa.active}`);
  }
}

main().catch(err => {
  console.error(err);
}).finally(() => {
  prisma.$disconnect();
});
