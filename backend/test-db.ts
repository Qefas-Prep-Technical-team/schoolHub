import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const refreshTokens = await prisma.refreshToken.findMany({
    take: 1
  });

  console.log("Refresh tokens test:", JSON.stringify(refreshTokens, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
