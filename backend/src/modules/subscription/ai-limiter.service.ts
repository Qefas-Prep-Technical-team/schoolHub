import prisma from "../../config/database";
import { UserRole } from "@prisma/client";
import { PLAN_LIMITS, DEFAULT_PLAN } from "./plan.constants";

export class AiLimiterService {
  /**
   * Resolves the daily AI usage limit for a given user or their associated school.
   */
  public static async getAiDailyLimit(
    userId: string,
    userType: UserRole,
    schoolId?: string
  ): Promise<number> {
    // 1. If user is ADMIN, check school limits first
    if (userType === UserRole.ADMIN && schoolId) {
      const school = await prisma.school.findUnique({ where: { id: schoolId } });
      if (school) {
        const isExpired = school.subscriptionEnd && new Date(school.subscriptionEnd) < new Date();
        
        if (!isExpired && school.maxAiUsageOverride !== null && school.maxAiUsageOverride !== undefined) {
          return school.maxAiUsageOverride;
        }
        const activePlanId = (school as any).subscriptionPlanId || (school as any).planId;
        if (!isExpired && activePlanId) {
          const plan = await prisma.subscriptionPlan.findUnique({ where: { id: activePlanId } });
          if (plan) return plan.maxAiUsage;
        }
        const planName = isExpired ? DEFAULT_PLAN.toUpperCase() : (school.plan || DEFAULT_PLAN).toUpperCase();
        const limits = PLAN_LIMITS[planName] || PLAN_LIMITS[DEFAULT_PLAN];
        return limits.maxAiUsage;
      }
    }

    // 2. Check individual user limits (TEACHER, etc.)
    const roleKey = userType.toLowerCase();
    const userModel = (prisma as any)[roleKey];
    if (userModel) {
      const user = await userModel.findUnique({ where: { id: userId } });
      if (user) {
        const isExpired = user.subscriptionEnd && new Date(user.subscriptionEnd) < new Date();
        
        if (!isExpired && user.maxAiUsageOverride !== null && user.maxAiUsageOverride !== undefined) {
          return user.maxAiUsageOverride;
        }
        const activePlanId = (user as any).subscriptionPlanId || (user as any).planId;
        if (!isExpired && activePlanId) {
          const plan = await prisma.subscriptionPlan.findUnique({ where: { id: activePlanId } });
          if (plan) return plan.maxAiUsage;
        }
        const planName = isExpired ? DEFAULT_PLAN.toUpperCase() : (user.plan || DEFAULT_PLAN).toUpperCase();
        const limits = PLAN_LIMITS[planName] || PLAN_LIMITS[DEFAULT_PLAN];
        return limits.maxAiUsage;
      }
    }

    // 3. Fallback to school if user doesn't have personal limits but is associated with a school
    if (schoolId) {
      const school = await prisma.school.findUnique({ where: { id: schoolId } });
      if (school) {
        const isExpired = school.subscriptionEnd && new Date(school.subscriptionEnd) < new Date();
        
        if (!isExpired && school.maxAiUsageOverride !== null && school.maxAiUsageOverride !== undefined) {
          return school.maxAiUsageOverride;
        }
        const activePlanId = (school as any).subscriptionPlanId || (school as any).planId;
        if (!isExpired && activePlanId) {
          const plan = await prisma.subscriptionPlan.findUnique({ where: { id: activePlanId } });
          if (plan) return plan.maxAiUsage;
        }
        const planName = isExpired ? DEFAULT_PLAN.toUpperCase() : (school.plan || DEFAULT_PLAN).toUpperCase();
        const limits = PLAN_LIMITS[planName] || PLAN_LIMITS[DEFAULT_PLAN];
        return limits.maxAiUsage;
      }
    }

    return PLAN_LIMITS[DEFAULT_PLAN].maxAiUsage;
  }

  /**
   * Retrieves current daily AI usage stats for a user.
   */
  public static async getAiUsageStats(
    userId: string,
    userType: UserRole,
    schoolId?: string
  ) {
    const limit = await this.getAiDailyLimit(userId, userType, schoolId);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const current = await (prisma as any).aiUsageLog.count({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const remaining = Math.max(0, limit - current);

    return {
      current,
      limit,
      remaining,
    };
  }

  /**
   * Logs a new AI usage call.
   */
  public static async logAiUsage(userId: string, action: string) {
    return await (prisma as any).aiUsageLog.create({
      data: {
        userId,
        action,
      },
    });
  }
}
