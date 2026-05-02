import prisma from "../../config/database";
import { SubscriptionType, SubscriptionStatus, PlanScope } from "@prisma/client";

/**
 * Service to manage Institutional (School) level subscriptions.
 */
export class SchoolSubscriptionService {
  /**
   * Initializes a school with the default FREE plan.
   * Used during school registration.
   */
  static async initializeFreePlan(schoolId: string) {
    const freePlan = await prisma.subscriptionPlan.findFirst({
      where: {
        planScope: PlanScope.SCHOOL,
        type: "free",
        category: "schools",
      },
    });

    if (!freePlan) {
      throw new Error("Default FREE school plan not found in database.");
    }

    return await prisma.$transaction(async (tx) => {
      // Create the school subscription
      const subscription = await tx.schoolSubscription.upsert({
        where: { schoolId },
        create: {
          schoolId,
          subscriptionPlanId: freePlan.id,
          subscriptionType: SubscriptionType.FREE,
          status: SubscriptionStatus.ACTIVE,
          startedAt: new Date(),
        },
        update: {
          subscriptionPlanId: freePlan.id,
          subscriptionType: SubscriptionType.FREE,
          status: SubscriptionStatus.ACTIVE,
        }
      });

      // Update school record with plan details
      await tx.school.update({
        where: { id: schoolId },
        data: {
          plan: freePlan.name,
          planId: freePlan.id,
          subscriptionPlanId: freePlan.id,
          lastPaymentDate: new Date(),
          subscriptionStatus: "ACTIVE"
        }
      });

      // Log to history
      await tx.subscriptionHistory.create({
        data: {
          schoolId,
          subscriptionPlanId: freePlan.id,
          subscriptionType: SubscriptionType.FREE,
          status: SubscriptionStatus.ACTIVE,
          startedAt: new Date(),
          note: "Initial free plan assignment on registration",
        },
      });

      return subscription;
    });
  }

  /**
   * Assigns or upgrades a school plan.
   */
  static async updatePlan(params: {
    schoolId: string;
    planId: string;
    type: SubscriptionType;
    durationDays?: number;
    amountPaid?: number;
    paymentReference?: string;
    note?: string;
  }) {
    const { schoolId, planId, type, durationDays, amountPaid, paymentReference, note } = params;

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.planScope !== PlanScope.SCHOOL) {
      throw new Error("Invalid school subscription plan.");
    }

    const expiresAt = durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;

    return await prisma.$transaction(async (tx) => {
      // 1. Get current active subscription to close it in history
      const currentSub = await tx.schoolSubscription.findUnique({
        where: { schoolId },
      });

      if (currentSub) {
        // Record ending of previous plan in history if not already ended
        await tx.subscriptionHistory.updateMany({
          where: {
            schoolId,
            subscriptionPlanId: currentSub.subscriptionPlanId,
            endedAt: null,
          },
          data: {
            endedAt: new Date(),
          },
        });
      }

      // 2. Update or Create subscription
      const subscription = await tx.schoolSubscription.upsert({
        where: { schoolId },
        create: {
          schoolId,
          subscriptionPlanId: planId,
          subscriptionType: type,
          status: SubscriptionStatus.ACTIVE,
          startedAt: new Date(),
          expiresAt,
        },
        update: {
          subscriptionPlanId: planId,
          subscriptionType: type,
          status: SubscriptionStatus.ACTIVE,
          startedAt: new Date(),
          expiresAt,
          updatedAt: new Date(),
        },
      });

      // Update school record with plan details
      await tx.school.update({
        where: { id: schoolId },
        data: {
          plan: plan.name,
          planId: planId,
          subscriptionPlanId: planId,
          lastPaymentDate: new Date(),
          subscriptionEnd: expiresAt,
          subscriptionStatus: "ACTIVE"
        }
      });

      // 3. Log new plan to history
      await tx.subscriptionHistory.create({
        data: {
          schoolId,
          subscriptionPlanId: planId,
          subscriptionType: type,
          status: SubscriptionStatus.ACTIVE,
          startedAt: new Date(),
          amountPaid,
          paymentReference,
          note,
        },
      });

      return subscription;
    });
  }

  /**
   * Gets current active subscription for a school.
   */
  static async getActiveSubscription(schoolId: string) {
    return await prisma.schoolSubscription.findUnique({
      where: { schoolId },
      include: {
        subscriptionPlan: true,
      },
    });
  }
}
