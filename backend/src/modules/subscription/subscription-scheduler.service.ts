import prisma from "../../config/database";
import { SubscriptionStatus } from "@prisma/client";
import { MailService, EmailType } from "../notification/mail.service";

/**
 * Service to handle automated background tasks for subscriptions.
 */
export class SubscriptionScheduler {
  /**
   * Scans all active subscriptions and marks those past their expiry date as EXPIRED.
   */
  static async processExpirations() {
    console.log("[Subscription Scheduler] Starting expiration scan...");
    const now = new Date();

    const results = await prisma.$transaction(async (tx) => {
      const schoolsToNotify = await tx.schoolSubscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          expiresAt: { lt: now },
          autoRenew: false,
        },
        include: { school: true }
      });

      const usersToNotify = await tx.userSubscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          expiresAt: { lt: now },
          autoRenew: false,
        },
        include: { user: true }
      });

      // 1. Process School Subscriptions
      const expiredSchools = await tx.schoolSubscription.updateMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          expiresAt: { lt: now },
          autoRenew: false,
        },
        data: {
          status: SubscriptionStatus.EXPIRED,
          updatedAt: now,
        },
      });

      // 2. Process User Subscriptions
      const expiredUsers = await tx.userSubscription.updateMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          expiresAt: { lt: now },
          autoRenew: false,
        },
        data: {
          status: SubscriptionStatus.EXPIRED,
          updatedAt: now,
        },
      });

      return {
        schools: expiredSchools.count,
        users: expiredUsers.count,
        schoolsToNotify,
        usersToNotify
      };
    });

    // Send School Emails
    for (const sub of results.schoolsToNotify) {
        if (!sub.school.schoolEmail) continue;
        await MailService.sendSchoolEmail({
          schoolId: sub.schoolId,
          to: sub.school.schoolEmail,
          subject: "Your SchoolHub Subscription Has Expired",
          type: "SUBSCRIPTION_EXPIRED",
          body: `
            <h1>Subscription Expired</h1>
            <p>Hello ${sub.school.name},</p>
            <p>Your SchoolHub subscription has officially expired. Access to premium features has been suspended.</p>
            <p>Please log in and renew your plan to restore full functionality for your students and teachers.</p>
            <p>Best regards,<br/>SchoolHub Team</p>
          `
        });
    }

    console.log(`[Subscription Scheduler] Scan completed. Schools expired: ${results.schools}, Users expired: ${results.users}`);
    return results;
  }

  /**
   * Sends warning emails for subscriptions about to expire.
   */
  static async processNotifications() {
    console.log("[Subscription Scheduler] Starting notification scan...");
    const now = new Date();
    
    // Check for 7, 3, and 1 day warnings
    const intervals = [
      { days: 7, type: "SUBSCRIPTION_EXPIRY_WARNING_7" as EmailType },
      { days: 3, type: "SUBSCRIPTION_EXPIRY_WARNING_3" as EmailType },
      { days: 1, type: "SUBSCRIPTION_EXPIRY_WARNING_1" as EmailType },
    ];

    for (const interval of intervals) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + interval.days);
      
      // Find school subscriptions expiring exactly on this target date (ignoring time)
      const startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);

      const expiringSoon = await prisma.schoolSubscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          expiresAt: {
            gte: startDate,
            lte: endDate
          },
          autoRenew: false
        },
        include: {
          school: true
        }
      });

      for (const sub of expiringSoon) {
        if (!sub.school.schoolEmail) continue;

        // Check if we already sent this type of warning recently (to avoid duplicates)
        const alreadySent = await prisma.emailLog.findFirst({
          where: {
            schoolId: sub.schoolId,
            type: interval.type,
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Within last 24h
            }
          }
        });

        if (alreadySent) continue;

        await MailService.sendSchoolEmail({
          schoolId: sub.schoolId,
          to: sub.school.schoolEmail,
          subject: `Urgent: Your SchoolHub Subscription Expires in ${interval.days} Day(s)`,
          type: interval.type,
          body: `
            <h1>Subscription Expiry Warning</h1>
            <p>Hello ${sub.school.name},</p>
            <p>Your SchoolHub subscription is set to expire in <strong>${interval.days} day(s)</strong> (on ${sub.expiresAt.toLocaleDateString()}).</p>
            <p>To avoid service interruption for your students and teachers, please renew your plan as soon as possible.</p>
            <p>Best regards,<br/>SchoolHub Team</p>
          `
        });
      }
    }
  }

  /**
   * Starts the internal timer for the scheduler.
   * Typically called once on server startup.
   */
  static start(intervalMs: number = 24 * 60 * 60 * 1000) { // Default to once a day
    console.log(`[Subscription Scheduler] Initialized with interval: ${intervalMs}ms`);
    
    // Run immediately on start
    const run = async () => {
      await this.processExpirations();
      await this.processNotifications();
    };

    run().catch(err => console.error("[Subscription Scheduler] Initial run failed:", err));

    // Schedule regular runs
    setInterval(() => {
      run().catch(err => console.error("[Subscription Scheduler] Periodic run failed:", err));
    }, intervalMs);
  }
}
