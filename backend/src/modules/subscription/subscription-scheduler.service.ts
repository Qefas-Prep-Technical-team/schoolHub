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
      const schoolsToNotify = await (tx as any).schoolSubscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          expiresAt: { lt: now },
          autoRenew: false,
        },
        include: { school: true }
      });

      const usersToNotify = await (tx as any).userSubscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          expiresAt: { lt: now },
          autoRenew: false,
        },
        include: {
          teacher: true,
          student: true,
          admin: true,
          parent: true
        }
      });

      // 1. Process School Subscriptions: check each expired school for a PENDING_DOWNGRADE first
      for (const schoolSub of schoolsToNotify) {
        const pendingDowngrade = await tx.transaction.findFirst({
          where: {
            schoolId: schoolSub.schoolId,
            status: "PENDING_DOWNGRADE",
          },
          orderBy: { createdAt: "desc" },
        });

        if (pendingDowngrade && pendingDowngrade.planId) {
          const newCycle = pendingDowngrade.billingCycle === "yearly" ? "yearly" : "monthly";
          const newEnd = new Date(now);
          newEnd.setMonth(newEnd.getMonth() + (newCycle === "yearly" ? 12 : 1));

          await (tx as any).schoolSubscription.update({
            where: { schoolId: schoolSub.schoolId },
            data: {
              subscriptionPlanId: pendingDowngrade.planId,
              status: SubscriptionStatus.ACTIVE,
              expiresAt: newEnd,
              updatedAt: now,
            },
          });

          await tx.school.update({
            where: { id: schoolSub.schoolId },
            data: {
              plan: pendingDowngrade.plan,
              planId: pendingDowngrade.planId,
              subscriptionPlanId: pendingDowngrade.planId,
              subscriptionStatus: "ACTIVE",
              subscriptionEnd: newEnd,
              billingCycle: newCycle,
              isTrialActive: false,
              pendingPlan: null,
              pendingPlanId: null,
              pendingBillingCycle: null,
            } as any,
          });

          await tx.transaction.update({
            where: { id: pendingDowngrade.id },
            data: { status: "SUCCESS" },
          });

          console.log(`[Subscription Scheduler] Applied scheduled downgrade to ${pendingDowngrade.plan} for school ${schoolSub.schoolId}`);
          continue;
        }

        // Standard Expiration to FREE tier
        await (tx as any).schoolSubscription.update({
          where: { schoolId: schoolSub.schoolId },
          data: {
            status: SubscriptionStatus.EXPIRED,
            updatedAt: now,
          },
        });

        await tx.school.update({
          where: { id: schoolSub.schoolId },
          data: {
            plan: "FREE",
            subscriptionStatus: "EXPIRED",
            isTrialActive: false,
          },
        });
      }

      // Close history records for expired schools
      await tx.subscriptionHistory.updateMany({
        where: {
          schoolId: { in: schoolsToNotify.map((s: any) => s.schoolId) },
          endedAt: null,
        },
        data: {
          endedAt: now,
          status: SubscriptionStatus.EXPIRED
        }
      });

      // 2. Process User Subscriptions
      for (const userSub of usersToNotify) {
        await (tx as any).userSubscription.update({
          where: { userId: userSub.userId },
          data: {
            status: SubscriptionStatus.EXPIRED,
            updatedAt: now,
          },
        });

        // Synchronize base user tables (teacher, student, parent, admin)
        const roleTable = userSub.userType ? userSub.userType.toLowerCase() : "student";
        const model = (tx as any)[roleTable];
        if (model) {
          await model.update({
            where: { id: userSub.userId },
            data: {
              plan: "FREE",
              subscriptionStatus: "EXPIRED",
              isTrialActive: false,
            },
          }).catch((err: any) => console.warn(`[Subscription Scheduler] Sync base user table ${roleTable} failed:`, err?.message));
        }
      }

      // Close history records for expired users
      await tx.subscriptionHistory.updateMany({
        where: {
          userId: { in: usersToNotify.map((u: any) => u.userId) },
          endedAt: null,
        },
        data: {
          endedAt: now,
          status: SubscriptionStatus.EXPIRED
        }
      });

      return {
        schools: schoolsToNotify.length,
        users: usersToNotify.length,
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
        subject: "Your Qefas Hub Subscription Has Expired",
        type: "SUBSCRIPTION_EXPIRED",
        body: `
            <h1>Subscription Expired</h1>
            <p>Hello ${sub.school.name},</p>
            <p>Your Qefas Hub subscription has officially expired. Access to premium features has been suspended.</p>
            <p>Please log in and renew your plan to restore full functionality for your students and teachers.</p>
            <p>Best regards,<br/>Qefas Hub Team</p>
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

      const expiringSoon = await (prisma as any).schoolSubscription.findMany({
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
        const alreadySent = await (prisma as any).emailLog.findFirst({
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
          subject: `Urgent: Your Qefas Hub Subscription Expires in ${interval.days} Day(s)`,
          type: interval.type,
          body: `
            <h1>Subscription Expiry Warning</h1>
            <p>Hello ${sub.school.name},</p>
            <p>Your Qefas Hub subscription is set to expire in <strong>${interval.days} day(s)</strong> (on ${sub.expiresAt.toLocaleDateString()}).</p>
            <p>To avoid service interruption for your students and teachers, please renew your plan as soon as possible.</p>
            <p>Best regards,<br/>Qefas Hub Team</p>
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
