import prisma from "../../config/database";
import { SubscriptionType, SubscriptionStatus, PlanScope, UserRole, Prisma } from "@prisma/client";

/**
 * Service to manage Individual User level subscriptions (Teacher, Parent, Student).
 */
export class UserSubscriptionService {
  /**
   * Initializes a user with the default FREE plan.
   * Used during user registration.
   */
  static async initializeFreePlan(userId: string, userType: UserRole, tx?: Prisma.TransactionClient, planId?: string) {
    // Resolve the environment-based plan ID with no fallbacks
    let effectivePlanId = planId;

    if (!effectivePlanId) {
      switch (userType) {
        case UserRole.ADMIN:
          effectivePlanId = process.env.SCHOOL_FREE_PLAN;
          break;
        case UserRole.TEACHER:
          effectivePlanId = process.env.TEACHER_FREE_PLAN;
          break;
        case UserRole.STUDENT:
          effectivePlanId = process.env.STUDENT_FREE_PLAN;
          break;
        case UserRole.PARENT:
          effectivePlanId = process.env.PARENT_FREE_PLAN;
          break;
      }
    }

    if (!effectivePlanId) {
      throw new Error(`Required FREE plan environment variable is missing for role: ${userType}.`);
    }

    const freePlan = await (tx || prisma).subscriptionPlan.findUnique({
      where: { id: effectivePlanId },
    });

    if (!freePlan) {
      throw new Error(`The configured free plan ID (${effectivePlanId}) for ${userType} was not found in the database.`);
    }

    const execute = async (t: Prisma.TransactionClient) => {
      const subscription = await t.userSubscription.upsert({
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

      // Update user record with plan details based on role
      const updateData = {
        plan: freePlan.name,
        planId: freePlan.id,
        subscriptionPlanId: freePlan.id,
        lastPaymentDate: new Date(),
        subscriptionStatus: "ACTIVE"
      };

      if (userType === UserRole.ADMIN) {
        await t.admin.update({ where: { id: userId }, data: updateData });
      } else if (userType === UserRole.TEACHER) {
        await t.teacher.update({ where: { id: userId }, data: updateData });
      } else if (userType === UserRole.STUDENT) {
        await t.student.update({ where: { id: userId }, data: updateData });
      } else if (userType === UserRole.PARENT) {
        await t.parent.update({ where: { id: userId }, data: updateData });
      }

      await t.subscriptionHistory.create({
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
    };

    return tx ? execute(tx) : prisma.$transaction(execute);
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
    isTrial?: boolean;
    trialPlan?: string;
    trialEndsAt?: Date;
  }) {
    const { 
      userId, userType, planId, type, durationDays, amountPaid, 
      paymentReference, note, isTrial, trialPlan, trialEndsAt 
    } = params;

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    
    // Validate scope compatibility
    const isSchoolPlanForAdmin = plan?.planScope === PlanScope.SCHOOL && userType === UserRole.ADMIN;
    const isIndividualPlanForIndividual = plan?.planScope !== PlanScope.SCHOOL && userType !== UserRole.ADMIN;

    if (!plan || (!isSchoolPlanForAdmin && !isIndividualPlanForIndividual)) {
      throw new Error(`Invalid plan scope for role ${userType}. Plan scope is ${plan?.planScope}.`);
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
          subscriptionStatus: "ACTIVE",
          // Trial Tracking Fields
          isTrialActive: isTrial || false,
          trialUsed: isTrial ? true : undefined,
          trialPlan: isTrial ? trialPlan : undefined,
          trialEndsAt: isTrial ? trialEndsAt : undefined,
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
          expiresAt,
          amountPaid,
          paymentReference,
          activatedBy: userId, // Track who activated this (Admin/User ID)
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
   * Helper to resolve Category from UserRole.
   */
  private static resolveCategory(role: UserRole): string {
    switch (role) {
      case UserRole.TEACHER: return "teachers";
      case UserRole.PARENT: return "parents";
      case UserRole.STUDENT: return "students";
      case UserRole.ADMIN: return "schools";
      default: return "schools";
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
