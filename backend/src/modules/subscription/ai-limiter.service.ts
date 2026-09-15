import prisma from "../../config/database";
import { UserRole } from "@prisma/client";
import { PLAN_LIMITS, DEFAULT_PLAN } from "./plan.constants";
import { EntitlementService } from "./entitlement.service";

/** Minimum daily AI prompts guaranteed to every teacher linked to a school */
const TEACHER_SCHOOL_MIN_DAILY_AI = 10;

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

    // 2. Teachers linked to a school get a guaranteed minimum of 10 prompts/day,
    //    tracked individually. Their personal plan or school plan can grant more.
    if (userType === UserRole.TEACHER) {
      // Check for a personal maxAiUsageOverride on the teacher record
      const teacher = await (prisma as any).teacher.findUnique({ where: { id: userId } });
      if (teacher) {
        const isExpired = teacher.subscriptionEnd && new Date(teacher.subscriptionEnd) < new Date();

        // Explicit personal override takes precedence
        if (!isExpired && teacher.maxAiUsageOverride !== null && teacher.maxAiUsageOverride !== undefined) {
          return teacher.maxAiUsageOverride;
        }

        // Personal subscription plan
        const activePlanId = (teacher as any).subscriptionPlanId || (teacher as any).planId;
        if (!isExpired && activePlanId) {
          const plan = await prisma.subscriptionPlan.findUnique({ where: { id: activePlanId } });
          if (plan && plan.maxAiUsage > TEACHER_SCHOOL_MIN_DAILY_AI) return plan.maxAiUsage;
        }
      }

      // School plan (take the higher of school plan or minimum guarantee)
      const resolvedSchoolId = schoolId || teacher?.schoolId || teacher?.activeSchoolId || teacher?.primarySchoolId;
      if (resolvedSchoolId) {
        const school = await prisma.school.findUnique({ where: { id: resolvedSchoolId } });
        if (school) {
          const isExpired = school.subscriptionEnd && new Date(school.subscriptionEnd) < new Date();

          if (!isExpired && school.maxAiUsageOverride !== null && school.maxAiUsageOverride !== undefined) {
            return Math.max(school.maxAiUsageOverride, TEACHER_SCHOOL_MIN_DAILY_AI);
          }
          const activePlanId = (school as any).subscriptionPlanId || (school as any).planId;
          if (!isExpired && activePlanId) {
            const plan = await prisma.subscriptionPlan.findUnique({ where: { id: activePlanId } });
            if (plan) return Math.max(plan.maxAiUsage, TEACHER_SCHOOL_MIN_DAILY_AI);
          }
          const planName = isExpired ? DEFAULT_PLAN.toUpperCase() : (school.plan || DEFAULT_PLAN).toUpperCase();
          const limits = PLAN_LIMITS[planName] || PLAN_LIMITS[DEFAULT_PLAN];
          return Math.max(limits.maxAiUsage, TEACHER_SCHOOL_MIN_DAILY_AI);
        }
      }

      // Teacher exists but no school — still grant minimum
      return TEACHER_SCHOOL_MIN_DAILY_AI;
    }

    // 3. Check individual user limits for other roles — but ONLY if enforcement is enabled for that role
    const roleCategory = userType.toLowerCase();
    const isEnforced = await EntitlementService.isEnforced(roleCategory);

    if (isEnforced) {
      const userModel = (prisma as any)[roleCategory];
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
    }

    // 4. Fallback to school if user doesn't have personal limits but is associated with a school
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

