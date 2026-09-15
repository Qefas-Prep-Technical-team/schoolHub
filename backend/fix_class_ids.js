const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const links = await prisma.relationshipLink.findMany({ 
    where: { rightEntityType: 'CLASS', classId: null } 
  });
  console.log('Found', links.length, 'links to fix');
  for (const link of links) {
    await prisma.relationshipLink.update({
      where: { id: link.id },
      data: { classId: link.rightEntityId }
    });
    console.log('Updated', link.id, 'with classId', link.rightEntityId);
  }

  const leftLinks = await prisma.relationshipLink.findMany({ 
    where: { leftEntityType: 'CLASS', classId: null } 
  });
  console.log('Found', leftLinks.length, 'left links to fix');
  for (const link of leftLinks) {
    await prisma.relationshipLink.update({
      where: { id: link.id },
      data: { classId: link.leftEntityId }
    });
    console.log('Updated', link.id, 'with classId', link.leftEntityId);
  }
  
  console.log('Done!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
