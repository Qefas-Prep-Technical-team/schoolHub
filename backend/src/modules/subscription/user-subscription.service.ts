import prisma from "../../config/database";
import { SubscriptionType, SubscriptionStatus, PlanScope, UserRole } from "@prisma/client";

/**
 * Service to manage Individual User level subscriptions (Teacher, Parent, Student).
 */
export class UserSubscriptionService {
  /**
   * Initializes a user with the default FREE plan.
   * Used during user registration.
   */
  static async initializeFreePlan(userId: string, userType: UserRole) {
    const scope = this.resolveScope(userType);
    const freePlan = await prisma.subscriptionPlan.findFirst({
      where: {
        planScope: scope,
        type: "free",
      },
    });

    if (!freePlan) {
      // It's possible some user types don't have free plans yet, so we just skip
      return null;
    }

    return await prisma.$transaction(async (tx) => {
      const subscription = await tx.userSubscription.upsert({
        where: { userId },
        create: {
          userId,
          userType,
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

      // Update user record with plan details
      const userModel = userType.toLowerCase() as any;
      await (tx as any)[userModel].update({
        where: { id: userId },
        data: {
          plan: freePlan.name,
          planId: freePlan.id,
          subscriptionPlanId: freePlan.id,
          lastPaymentDate: new Date(),
          subscriptionStatus: "ACTIVE"
        }
      });

      await tx.subscriptionHistory.create({
        data: {
          userId,
          userType,
          subscriptionPlanId: freePlan.id,
          subscriptionType: SubscriptionType.FREE,
          status: SubscriptionStatus.ACTIVE,
          startedAt: new Date(),
          note: `Initial free ${userType.toLowerCase()} plan assignment`,
        },
      });

      return subscription;
    });
  }

  /**
   * Assigns or upgrades a personal user plan.
   */
  static async updatePlan(params: {
    userId: string;
    userType: UserRole;
    planId: string;
    type: SubscriptionType;
    durationDays?: number;
    amountPaid?: number;
    paymentReference?: string;
    note?: string;
  }) {
    const { userId, userType, planId, type, durationDays, amountPaid, paymentReference, note } = params;

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.planScope === PlanScope.SCHOOL) {
      throw new Error("Invalid individual subscription plan.");
    }

    const expiresAt = durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;

    return await prisma.$transaction(async (tx) => {
      const currentSub = await tx.userSubscription.findUnique({
        where: { userId },
      });

      if (currentSub) {
        await tx.subscriptionHistory.updateMany({
          where: {
            userId,
            subscriptionPlanId: currentSub.subscriptionPlanId,
            endedAt: null,
          },
          data: {
            endedAt: new Date(),
          },
        });
      }

      const subscription = await tx.userSubscription.upsert({
        where: { userId },
        create: {
          userId,
          userType,
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

      // Update user record with plan details
      const userModel = userType.toLowerCase() as any;
      await (tx as any)[userModel].update({
        where: { id: userId },
        data: {
          plan: plan.name,
          planId: planId,
          subscriptionPlanId: planId,
          lastPaymentDate: new Date(),
          subscriptionEnd: expiresAt,
          subscriptionStatus: "ACTIVE"
        }
      });

      await tx.subscriptionHistory.create({
        data: {
          userId,
          userType,
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
   * Helper to resolve PlanScope from UserRole.
   */
  private static resolveScope(role: UserRole): PlanScope {
    switch (role) {
      case UserRole.TEACHER: return PlanScope.TEACHER;
      case UserRole.PARENT: return PlanScope.PARENT;
      case UserRole.STUDENT: return PlanScope.STUDENT;
      case UserRole.ADMIN: return PlanScope.SCHOOL; // Admins usually manage school level
      default: return PlanScope.SCHOOL;
    }
  }

  /**
   * Gets current active subscription for a user.
   */
  static async getActiveSubscription(userId: string) {
    return await prisma.userSubscription.findUnique({
      where: { userId },
      include: {
        subscriptionPlan: true,
      },
    });
  }
}
