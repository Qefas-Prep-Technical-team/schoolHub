const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
  const e = await prisma.exam.findFirst({ 
    where: { title: { contains: 'Law' } }, 
    include: { subjectExamPapers: { include: { subjectPaper: true } } } 
  }); 
  console.log(JSON.stringify(e, null, 2)); 
} 

main().finally(()=>prisma.$disconnect());
