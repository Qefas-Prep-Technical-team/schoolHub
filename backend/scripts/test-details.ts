import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const id = 'qefas-prep-63f'; // A valid tenantId
  console.log('Testing fetching for ID (lookup by ID or tenantId):', id);
  
  try {
    const school = await prisma.school.findFirst({
      where: {
        OR: [
          { id: id },
          { tenantId: id }
        ]
      },
      include: {
        subscriptionPlan: true,
        settings: true,
        settlementAccounts: true,
        emailLogs: {
          orderBy: {
            createdAt: "desc"
          },
          take: 50
        },
        _count: {
          select: {
            students: true,
            admins: true,
            teachers: true,
            exams: true,
            classes: true
          }
        }
      }
    });

    console.log('School found:', !!school);
    if (school) {
        console.log('School Name:', school.name);
        console.log('UUID:', school.id);
        console.log('TenantID:', school.tenantId);
        console.log('Plan:', school.subscriptionPlan?.name);
    }
  } catch (error) {
    console.error('CRASH DETECTED:', error);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
