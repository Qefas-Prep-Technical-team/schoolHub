import prisma from "../../config/database";
import { SubscriptionType, SubscriptionStatus, PlanScope, Prisma } from "@prisma/client";

/**
 * Service to manage Institutional (School) level subscriptions.
 */
export class SchoolSubscriptionService {
  /**
   * Initializes a school with the default FREE plan.
   * Used during school registration.
   */
  static async initializeFreePlan(schoolId: string, tx?: Prisma.TransactionClient, planId?: string) {
    const effectivePlanId = planId || process.env.SCHOOL_FREE_PLAN;
    const client = tx || prisma;
    let freePlan: any = null;

    if (effectivePlanId) {
      freePlan = await client.subscriptionPlan.findUnique({
        where: { id: effectivePlanId },
      });
    }

    if (!freePlan) {
      freePlan = await client.subscriptionPlan.findFirst({
        where: {
          planScope: PlanScope.SCHOOL,
          OR: [
            { type: "FREE" },
            { monthlyPrice: 0 },
            { name: { contains: "Free", mode: "insensitive" } }
          ]
        }
      });
    }

    if (!freePlan) {
      freePlan = await client.subscriptionPlan.findFirst({
        where: {
          OR: [
            { type: "FREE" },
            { monthlyPrice: 0 },
            { name: { contains: "Free", mode: "insensitive" } }
          ]
        }
      });
    }

    if (!freePlan) {
      console.warn(`[SchoolSubscriptionService] No free subscription plan found in database for school ${schoolId}. Skipping initial assignment.`);
      return null;
    }

    const execute = async (t: Prisma.TransactionClient) => {
      // Create the school subscription
      const subscription = await t.schoolSubscription.upsert({
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
      await t.school.update({
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
      await t.subscriptionHistory.create({
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
    };

    return tx ? execute(tx) : prisma.$transaction(execute);
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
    isTrial?: boolean;
    trialPlan?: string;
    trialEndsAt?: Date;
    assignedBy?: string;
  }) {
    const { 
      schoolId, planId, type, durationDays, amountPaid, 
      paymentReference, note, isTrial, trialPlan, 
      trialEndsAt, assignedBy 
    } = params;

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.planScope !== PlanScope.SCHOOL) {
      throw new Error("Invalid school subscription plan.");
    }

    const expiresAt = durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;

    return await prisma.$transaction(async (tx) => {
      // The previous plan history record remains open (endedAt: null) until it explicitly expires via the scheduler
      // This ensures endedAt is only set once the plan actually expires or is cancelled.

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
          assignedBy, // Track who assigned this plan (e.g. Admin ID)
        },
        update: {
          subscriptionPlanId: planId,
          subscriptionType: type,
          status: SubscriptionStatus.ACTIVE,
          startedAt: new Date(),
          expiresAt,
          assignedBy,
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
          subscriptionStatus: "ACTIVE",
          // Trial Tracking Fields
          isTrialActive: isTrial || false,
          trialUsed: isTrial ? true : undefined,
          trialPlan: isTrial ? trialPlan : undefined,
          trialEndsAt: isTrial ? trialEndsAt : undefined,
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
          expiresAt,
          amountPaid,
          paymentReference,
          activatedBy: assignedBy, // Track who activated this (Admin ID)
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
