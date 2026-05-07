import { PrismaClient } from '@prisma/client';
// Use DIRECT_URL explicitly
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.khogvaepivbqzlqndedv:QefasSchoolHub@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"
    }
  }
});

async function checkDirect() {
  console.log('Testing direct connection to port 5432...');
  const result = await prisma.$queryRaw`SELECT 1`;
  console.log('Direct connection success:', result);
}

checkDirect()
  .catch(e => console.error('Direct connection failed:', e))
  .finally(() => prisma.$disconnect());
