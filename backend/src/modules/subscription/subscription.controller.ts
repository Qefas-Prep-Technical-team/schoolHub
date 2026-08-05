import { Request, Response } from "express";
import { getSchoolUsageService, getUserUsageService } from "./quota.service";
import { hasFeatureAccess } from "../subscription-checkers";
import { handleError } from "../../utils/error-handler";
import { AiLimiterService } from "./ai-limiter.service";
import { SchoolSubscriptionService } from "./school-subscription.service";
import { UserSubscriptionService } from "./user-subscription.service";
export const getSubscriptionUsage = async (req: Request, res: Response) => {
  try {
    // Current schoolId is usually added to req by auth middleware or resolved from user token
    // Robust schoolId resolution matching dashboard patterns
    const userId = (req as any).user?.id;
    const role = (req as any).user?.userType || (req as any).user?.role;
    const schoolId = (req as any).user?.schoolId || (req as any).user?.tenantId;

    let data;

    // 1. If the user has a specific Personal Subscription, prioritize that for individual dashboards
    // 2. Otherwise, fall back to Institutional (School) usage
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      try {
        data = await getUserUsageService(userId, role);
      } catch (e) {
        return handleError(res, e, "subscription.getSubscriptionUsage");
      }
    } else if (schoolId && schoolId !== 'default-tenant-id') {
      data = await getSchoolUsageService(schoolId);
    } else {
      // Gracefully handle missing context without 400 error to avoid console noise
      return res.status(200).json({
        success: true,
        data: null,
        message: "No active institutional or personal context found for usage tracking."
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    return handleError(res, error, "subscription.getSubscriptionUsage");
  }
};

export const checkFeatureAccess = async (req: Request, res: Response) => {
  try {
    const featureKey = req.params.featureKey as string;
    const user = (req as any).user;
    const schoolId = req.query.schoolId as string;

    if (!user || !featureKey) {
      return res.status(400).json({
        success: false,
        message: "Missing user context or feature key"
      });
    }

    if (schoolId && !user.schoolId) {
      user.schoolId = schoolId;
    }

    const hasAccess = await hasFeatureAccess(user, featureKey);

    return res.status(200).json({
      success: true,
      hasAccess
    });
  } catch (error: any) {
    return handleError(res, error, "subscription.checkFeatureAccess");
  }
};

export const getAiUsage = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User context not found. Authentication required."
      });
    }

    const stats = await AiLimiterService.getAiUsageStats(
      user.id,
      user.userType,
      user.schoolId
    );

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    return handleError(res, error, "subscription.getAiUsage");
  }
};

export const activateFreePlan = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Only admins can activate a free plan for the school.",
      });
    }

    const schoolId = user.schoolId || user.tenantId; // Or however school is associated
    if (!schoolId) {
       return res.status(400).json({
         success: false,
         message: "No school associated with this admin.",
       });
    }

    // Call the exact logic that used to be in registerSchool
    await SchoolSubscriptionService.initializeFreePlan(schoolId);
    await UserSubscriptionService.initializeFreePlan(user.id, user.userType);

    return res.status(200).json({
      success: true,
      message: "Free plan activated successfully.",
    });
  } catch (error: any) {
    return handleError(res, error, "subscription.activateFreePlan");
  }
};
