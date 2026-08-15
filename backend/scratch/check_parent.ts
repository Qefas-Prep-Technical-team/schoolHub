import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const parents = await prisma.parent.findMany({
    include: {
      parentChildLinks: {
        include: {
          student: {
            include: {
              grades: true,
              attendances: true,
            }
          }
        }
      }
    }
  });
  console.log(JSON.stringify(parents, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
