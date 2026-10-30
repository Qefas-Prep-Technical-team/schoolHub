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

        // Send email to the school email (if exists)
        if (school.schoolEmail) {
          try {
            const { sendSubscriptionExpiredEmail } = require('../modules/auth/auth.service');
            await sendSubscriptionExpiredEmail(school.schoolEmail, school.plan || 'Premium');
          } catch (e) {
            console.error(`[CRON] Failed to send expiration email to school ${school.id}:`, e);
          }
        }
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

          // Send email to the user (if exists)
          if (user.email) {
            try {
              const { sendSubscriptionExpiredEmail } = require('../modules/auth/auth.service');
              await sendSubscriptionExpiredEmail(user.email, user.plan || 'Premium');
            } catch (e) {
              console.error(`[CRON] Failed to send expiration email to ${model} ${user.id}:`, e);
            }
          }
        }
      }

      console.log('[CRON] Daily subscription sweeper completed successfully.');
    } catch (error) {
      console.error('[CRON] Error running subscription sweeper:', error);
    }
  });

  // ─── Database Keep-Alive Ping ────────────────────────────────────────────────
  // Supabase PgBouncer drops idle connections after ~5 minutes. This lightweight
  // ping every 2 minutes keeps the pool alive.
  // Note: Observe-only — does NOT initiate reconnects to prevent racing with request-level recovery.
  // If 3 consecutive keep-alive pings fail, exit with code 1 so Render automatically restarts the container with a fresh engine.
  let consecutivePingFailures = 0;

  cron.schedule('*/2 * * * *', async () => {
    const { isReconnecting } = require('../config/database');
    if (isReconnecting && isReconnecting()) {
      console.log('[CRON] Database reconnect is currently in flight — skipping keep-alive ping.');
      return;
    }

    try {
      await prisma.$queryRaw`SELECT 1`;
      if (consecutivePingFailures > 0) {
        console.log(`[CRON] DB keep-alive recovered after ${consecutivePingFailures} failure(s).`);
      }
      consecutivePingFailures = 0;
      console.log('[CRON] DB keep-alive ping OK');
    } catch (err: unknown) {
      consecutivePingFailures++;
      console.error(
        `[CRON] ❌ DB keep-alive ping failed (consecutive failures: ${consecutivePingFailures}/3):`,
        {
          name: (err as Error)?.name,
          message: (err as Error)?.message,
          code: (err as Record<string, unknown>)?.code,
          meta: (err as Record<string, unknown>)?.meta,
        }
      );

      if (consecutivePingFailures >= 3) {
        console.error(
          '[CRON] 🚨 FATAL: 3 consecutive DB keep-alive pings failed. Exiting process with code 1 for clean Render container restart...'
        );
        process.exit(1);
      }
    }
  });
};

