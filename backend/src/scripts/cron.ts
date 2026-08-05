import cron from 'node-cron';
import prisma from '../config/database';
import { createNotification } from '../modules/notification/notification.service';
import { DEFAULT_PLAN } from '../modules/subscription/plan.constants';

export const startCronJobs = () => {
  console.log('[CRON] Initializing background jobs...');

  // Run every night at exactly midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily subscription sweeper...');
    
    try {
      const now = new Date();
      
      // 1. Process Expired Schools
      const expiredSchools = await prisma.school.findMany({
        where: {
          subscriptionEnd: {
            lt: now
          },
          subscriptionStatus: 'ACTIVE'
        }
      });

      console.log(`[CRON] Found ${expiredSchools.length} expired schools to update.`);

      for (const school of expiredSchools) {
        // Update school record
        await prisma.school.update({
          where: { id: school.id },
          data: {
            subscriptionStatus: 'EXPIRED',
            plan: DEFAULT_PLAN.toUpperCase(),
            // Optionally clear overrides here if needed:
            // maxStudentsOverride: null,
            // etc.
          }
        });

        // Try to update their SchoolSubscription record as well
        try {
          await prisma.schoolSubscription.update({
            where: { schoolId: school.id },
            data: {
              status: 'EXPIRED'
            }
          });
        } catch (e) {
          // Ignore if they don't have a structured SchoolSubscription record
        }

        // Send notification to school admins
        await createNotification({
          recipientType: 'SCHOOL',
          recipientId: school.id,
          type: 'GENERAL',
          title: 'Subscription Expired',
          message: `Your premium subscription has expired. Your account has been downgraded to the Free tier. Please renew to restore premium limits and features.`,
        });
      }

      // 2. Process Expired Individual Users
      const models = ['teacher', 'student', 'parent'] as const;
      
      for (const model of models) {
        const expiredUsers = await (prisma as any)[model].findMany({
          where: {
            subscriptionEnd: {
              lt: now
            },
            subscriptionStatus: 'ACTIVE'
          }
        });

        console.log(`[CRON] Found ${expiredUsers.length} expired ${model}s to update.`);

        for (const user of expiredUsers) {
          await (prisma as any)[model].update({
            where: { id: user.id },
            data: {
              subscriptionStatus: 'EXPIRED',
              plan: DEFAULT_PLAN.toUpperCase()
            }
          });

          // Update UserSubscription record
          try {
            await prisma.userSubscription.update({
              where: { userId: user.id },
              data: {
                status: 'EXPIRED'
              }
            });
          } catch (e) {}

          // Send notification to user
          await createNotification({
            recipientType: model.toUpperCase() as any,
            recipientId: user.id,
            type: 'GENERAL',
            title: 'Subscription Expired',
            message: `Your premium subscription has expired. Your account has been downgraded to the Free tier. Please renew to restore premium features.`,
          });
        }
      }

      console.log('[CRON] Daily subscription sweeper completed successfully.');
    } catch (error) {
      console.error('[CRON] Error running subscription sweeper:', error);
    }
  });

  // ─── Database Keep-Alive Ping ────────────────────────────────────────────────
  // Supabase PgBouncer drops idle connections after ~5 minutes. This lightweight
  // ping every 2 minutes keeps the pool alive, with active reconnect on failure.
  cron.schedule('*/2 * * * *', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('[CRON] DB keep-alive ping OK');
    } catch (err) {
      console.warn('[CRON] DB keep-alive ping failed — attempting reconnect:', (err as any)?.message || err);
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        console.log('[CRON] DB reconnected and verified OK');
      } catch (reconnectErr) {
        console.error('[CRON] DB reconnect also failed:', (reconnectErr as any)?.message || reconnectErr);
      }
    }
  });
};
