import { Request, Response } from "express";
import { getSchoolUsageService } from "./quota.service";

export const getSubscriptionUsage = async (req: Request, res: Response) => {
  try {
    // Current schoolId is usually added to req by auth middleware or resolved from user token
    // Robust schoolId resolution matching dashboard patterns
    const schoolId = (req as any).user?.schoolId || (req as any).user?.tenantId;

    if (!schoolId) {
      console.warn("[SubscriptionController] No schoolId or tenantId found in request user:", (req as any).user);
      return res.status(400).json({
        success: false,
        message: "Active school context not found."
      });
    }

    const data = await getSchoolUsageService(schoolId);

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
