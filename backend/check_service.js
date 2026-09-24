const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getSubjectPapersService } = require('./src/modules/exam/exam.service');

async function main() {
  const result = await getSubjectPapersService({ subjectId: 'some-id' }); // Mock subjectId
  console.log(result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
