import { Request, Response } from "express";
import { getSchoolUsageService, getUserUsageService } from "./quota.service";
import { hasFeatureAccess } from "../subscription-checkers";

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
        console.warn("[SubscriptionController] User-specific usage fetch failed, falling back to school usage:", e);
        if (schoolId) {
          data = await getSchoolUsageService(schoolId);
        } else {
          // If no schoolId fallback, return null data instead of throwing to avoid 500/400 errors
          return res.status(200).json({
            success: true,
            data: null,
            message: "User context resolved but no usage data or institutional fallback found."
          });
        }
      }
    } else if (schoolId) {
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
    console.error("[SubscriptionController] Error fetching usage:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subscription usage"
    });
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
    console.error(`[SubscriptionController] Error checking feature access:`, error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while verifying feature access."
    });
  }
};
