import prisma from './src/config/database';
import { getIncomingPendingLinkRequestsService, getActiveLinksService } from './src/modules/link/link.query.service';
import { LinkEntityType } from '@prisma/client';

async function test() {
  try {
    // We need a real user ID that is an ADMIN
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      console.log('No admin found to test with');
      return;
    }

    console.log(`Testing with Admin ID: ${admin.id}`);
    const result = await getIncomingPendingLinkRequestsService(
      {
        currentUserId: admin.id,
        currentUserType: LinkEntityType.ADMIN,
      },
      {}
    );
    console.log('Testing getActiveLinksService...');
    const activeResult = await getActiveLinksService(
      {
        currentUserId: admin.id,
        currentUserType: LinkEntityType.ADMIN,
      },
      { category: 'network' }
    );
    console.log('✅ Success Active:', JSON.stringify(activeResult.pagination));
  } catch (error: any) {
    console.error('❌ Failed:', error);
    if (error.stack) console.error(error.stack);
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
