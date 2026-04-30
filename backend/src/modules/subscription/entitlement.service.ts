import prisma from "../../config/database";
import { UserRole, SubscriptionStatus } from "@prisma/client";

/**
 * The EntitlementEngine is the central authority for checking feature access and quotas.
 * It checks both School (institutional) and User (individual) layers.
 */
export class EntitlementService {
  /**
   * Checks if a school has enough quota for a specific metric.
   * Throws an error if quota is exceeded.
   */
  static async validateSchoolQuota(schoolId: string, metric: "students" | "exams" | "classes" | "storageGb", incrementalValue = 0) {
    const subscription = await prisma.schoolSubscription.findUnique({
      where: { schoolId },
      include: { subscriptionPlan: true }
    });

    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error("Active school subscription not found. Please contact support.");
    }

    const plan = subscription.subscriptionPlan;
    let limit = 0;
    let usage = 0;

    switch (metric) {
      case "students":
        limit = plan.maxStudents;
        usage = await prisma.student.count({ where: { schoolId } });
        break;
      case "exams":
        limit = plan.maxExams;
        usage = await prisma.exam.count({ where: { schoolId } });
        break;
      case "classes":
        limit = plan.maxClasses;
        usage = await prisma.class.count({ where: { schoolId } });
        break;
      case "storageGb":
        limit = plan.maxStorageGb;
        const storageMetric = await prisma.fileMetric.aggregate({
          where: { schoolId },
          _sum: { fileSize: true },
        });
        usage = Number(storageMetric._sum.fileSize || 0) / (1024 * 1024 * 1024);
        break;
    }

    if (usage + incrementalValue > limit) {
      throw new Error(`School capacity reached for ${metric} (${limit}). Please upgrade your school plan.`);
    }

    return true;
  }

  /**
   * Checks if an individual user has a premium entitlement (e.g., AI features).
   */
  static async hasUserEntitlement(userId: string, feature: "ai_tools" | "advanced_analytics"): Promise<boolean> {
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId },
      include: { subscriptionPlan: true }
    });

    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      return false;
    }

    // Check if the feature string is in the plan's feature array
    return subscription.subscriptionPlan.features.includes(feature);
  }

  /**
   * Complex check: User might have access either via their school plan OR their personal plan.
   * "SaaS Hybrid Rule": Individual plan always overrides/augments school plan features for that user.
   */
  static async validateFeatureAccess(params: {
    userId: string;
    schoolId?: string;
    feature: string;
  }): Promise<boolean> {
    const { userId, schoolId, feature } = params;

    // 1. Check personal subscription first (Primary)
    const userSub = await prisma.userSubscription.findUnique({
      where: { userId },
      include: { 
        subscriptionPlan: {
          include: {
            featureAccess: {
              include: { feature: true }
            }
          }
        } 
      }
    });

    if (userSub?.status === SubscriptionStatus.ACTIVE) {
      // Check legacy array
      if (userSub.subscriptionPlan.features.includes(feature)) return true;
      
      // Check new relational system
      const hasAccess = userSub.subscriptionPlan.featureAccess.some(
        fa => fa.enabled && fa.feature.tag === feature
      );
      if (hasAccess) return true;
    }

    // 2. Check school subscription if schoolId is provided (Secondary)
    if (schoolId) {
      const schoolSub = await prisma.schoolSubscription.findUnique({
        where: { schoolId },
        include: { 
          subscriptionPlan: {
            include: {
              featureAccess: {
                include: { feature: true }
              }
            }
          }
        }
      });

      if (schoolSub?.status === SubscriptionStatus.ACTIVE) {
        // Check legacy array
        if (schoolSub.subscriptionPlan.features.includes(feature)) return true;
        
        // Check new relational system
        const hasAccess = schoolSub.subscriptionPlan.featureAccess.some(
          fa => fa.enabled && fa.feature.tag === feature
        );
        if (hasAccess) return true;
      }
    }

    return false;
  }

  /**
   * Secure server-side helper for quick feature access verification
   */
  static async hasFeatureAccess(userId: string, featureTag: string, schoolId?: string): Promise<boolean> {
    return await this.validateFeatureAccess({ userId, feature: featureTag, schoolId });
  }
}
