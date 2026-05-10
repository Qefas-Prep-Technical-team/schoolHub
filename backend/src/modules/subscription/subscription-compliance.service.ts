import prisma from "../../config/database";
import { SubscriptionStatus, SubscriptionType, UserRole } from "@prisma/client";
import { createNotification } from "../notification/notification.service";

/**
 * Service to handle real-time subscription compliance checks.
 * Ensures users are transitioned to FREE tier upon expiration.
 */
export class SubscriptionComplianceService {
  /**
   * Verifies the subscription status of a user or school and synchronizes it if expired.
   * If expired, transitions the entity to the FREE tier while flagging them as EXPIRED.
   */
  static async verifyAndSyncStatus(params: { userId: string; userType: UserRole; schoolId?: string | null }) {
    const { userId, userType, schoolId } = params;
    const now = new Date();

    // 1. If Admin, we primarily check the School's subscription
    if (userType === UserRole.ADMIN && schoolId) {
       await this.checkSchoolSubscription(schoolId, now);
    } 
    
    // 2. Also check the user's individual subscription (covers Teacher, Student, Parent, and Admin's personal sub if applicable)
    await this.checkUserSubscription(userId, userType, now);
  }

  private static async checkSchoolSubscription(schoolId: string, now: Date) {
    const sub = await prisma.schoolSubscription.findUnique({
      where: { schoolId },
    });

    if (sub && sub.status === SubscriptionStatus.ACTIVE && sub.expiresAt && sub.expiresAt < now) {
      const freePlanId = process.env.SCHOOL_FREE_PLAN;
      if (!freePlanId) {
        console.warn(`[Subscription Compliance] SCHOOL_FREE_PLAN ENV missing. Skipping transition for school ${schoolId}.`);
        return;
      }

      const freePlan = await prisma.subscriptionPlan.findUnique({ where: { id: freePlanId.trim() } });
      if (!freePlan) {
        console.warn(`[Subscription Compliance] FREE School Plan (${freePlanId}) not found in DB. Skipping transition for school ${schoolId}.`);
        return;
      }

      await prisma.$transaction(async (tx) => {
        // A. Mark previous history as EXPIRED
        await tx.subscriptionHistory.updateMany({
          where: { schoolId, endedAt: null },
          data: { 
            endedAt: now, 
            status: SubscriptionStatus.EXPIRED,
            note: "Automatically transitioned to FREE tier due to expiration."
          }
        });

        // B. Update School Subscription to FREE
        await tx.schoolSubscription.update({
          where: { schoolId },
          data: {
            subscriptionPlanId: freePlan.id,
            subscriptionType: SubscriptionType.FREE,
            status: SubscriptionStatus.ACTIVE,
            expiresAt: null,
            updatedAt: now,
          }
        });

        // C. Update School main record with the "EXPIRED" status flag
        await tx.school.update({
          where: { id: schoolId },
          data: {
            plan: freePlan.name,
            planId: freePlan.id,
            subscriptionPlanId: freePlan.id,
            subscriptionStatus: SubscriptionStatus.EXPIRED, // The Flag
          }
        });
        
        console.log(`[Subscription Compliance] School ${schoolId} transitioned to FREE tier (${freePlan.name}) due to expiration.`);

        // D. Trigger Notification
        await createNotification({
          recipientType: "SCHOOL",
          recipientId: schoolId,
          type: "GENERAL",
          title: "Subscription Expired",
          message: `Your subscription has expired. You have been automatically transitioned to the FREE tier to ensure continued access.`,
          meta: { previousPlanId: sub.subscriptionPlanId, currentPlanId: freePlan.id }
        });
      });
    }
  }

  private static async checkUserSubscription(userId: string, userType: UserRole, now: Date) {
    const sub = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    if (sub && sub.status === SubscriptionStatus.ACTIVE && sub.expiresAt && sub.expiresAt < now) {
      let freePlanId: string | undefined;
      switch (userType) {
        case UserRole.TEACHER: freePlanId = process.env.TEACHER_FREE_PLAN; break;
        case UserRole.STUDENT: freePlanId = process.env.STUDENT_FREE_PLAN; break;
        case UserRole.PARENT:  freePlanId = process.env.PARENT_FREE_PLAN; break;
        case UserRole.ADMIN:   freePlanId = process.env.SCHOOL_FREE_PLAN; break; // Admin personal usually follows school free plan or similar
      }

      if (!freePlanId) return;

      const freePlan = await prisma.subscriptionPlan.findUnique({ where: { id: freePlanId.trim() } });
      if (!freePlan) return;

      await prisma.$transaction(async (tx) => {
        // A. Mark previous history as EXPIRED
        await tx.subscriptionHistory.updateMany({
          where: { userId, endedAt: null },
          data: { 
            endedAt: now, 
            status: SubscriptionStatus.EXPIRED,
            note: "Automatically transitioned to FREE tier due to expiration."
          }
        });

        // B. Update User Subscription to FREE
        await tx.userSubscription.update({
          where: { userId },
          data: {
            subscriptionPlanId: freePlan.id,
            subscriptionType: SubscriptionType.FREE,
            status: SubscriptionStatus.ACTIVE,
            expiresAt: null,
            updatedAt: now,
          }
        });

        // C. Update User main model with the "EXPIRED" status flag
        const modelName = userType.toLowerCase();
        const model = (tx as any)[modelName];
        
        if (model) {
            await model.update({
              where: { id: userId },
              data: {
                plan: freePlan.name,
                planId: freePlan.id,
                subscriptionPlanId: freePlan.id,
                subscriptionStatus: SubscriptionStatus.EXPIRED, // The Flag
              }
            });
        }

        console.log(`[Subscription Compliance] User ${userId} (${userType}) transitioned to FREE tier (${freePlan.name}) due to expiration.`);

        // D. Trigger Notification
        await createNotification({
          recipientType: userType as any,
          recipientId: userId,
          type: "GENERAL",
          title: "Subscription Expired",
          message: `Your personal subscription has expired. You have been transitioned to the FREE tier.`,
          meta: { previousPlanId: sub.subscriptionPlanId, currentPlanId: freePlan.id }
        });
      });
    }
  }
}
