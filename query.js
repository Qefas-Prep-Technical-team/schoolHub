const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const results = await prisma.classSubjectResult.findMany({
    include: {
      class: true,
      subject: true,
      session: true,
      department: true
    }
  });
  console.log(JSON.stringify(results.map(r => ({
    id: r.id,
    name: r.name,
    className: r.class?.name,
    subjectName: r.subject?.name,
    departmentName: r.department?.name,
    term: r.term,
    sessionName: r.session?.name
  })), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
