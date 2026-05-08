import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

/**
 * Middleware to check if the user/school has an active subscription or trial
 */
export const checkSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const { id, userType, schoolId } = user;

    // For simplicity, we check the user's plan and subscriptionEnd
    // If it's an ADMIN, we check the School record instead
    let account: any;

    if (userType === "ADMIN") {
        if (!schoolId) {
            return res.status(403).json({ success: false, message: "Administrative link to school missing." });
        }
        account = await prisma.school.findUnique({ where: { id: schoolId } });
    } else {
        const modelName = userType.toLowerCase();
        account = await (prisma as any)[modelName].findUnique({ where: { id } });
    }

    if (!account) {
        return res.status(404).json({ success: false, message: "Profile information not found." });
    }

    // 1. Identify plan and expiration status
    const planName = (account.plan || "FREE").toUpperCase();
    const isFree = planName.includes("FREE") || planName === "BASIC" || planName === "STARTER_FREE";
    const subEnd = account.subscriptionEnd ? new Date(account.subscriptionEnd) : null;
    const now = new Date();
    const isExpired = subEnd && subEnd < now;
    const isTrial = account.isTrialActive === true;

    /**
     * ACCESS LOGIC:
     * - Allow if plan name contains "FREE"
     * - Allow if plan has a future expiration date
     * - Allow if NO expiration date exists and it's NOT a trial (assumes free/unlimited tier)
     */
    if (isFree || (subEnd && !isExpired) || (!subEnd && !isTrial)) {
        return next();
    }

    // 2. Handle denied access
    console.warn(`LOG: [subscriptionMiddleware] Access denied for ${userType} ${id}. Plan: ${planName}, End: ${subEnd}, Trial: ${isTrial}`);
    
    return res.status(402).json({ 
        success: false, 
        message: isTrial ? "Your trial has expired. Please upgrade to continue." : "Your subscription has expired. Please renew to continue.",
        code: "SUBSCRIPTION_EXPIRED"
    });

    // All good, proceed
    next();
  } catch (error: any) {
    console.error("[SubscriptionMiddleware] Check Error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error during subscription check." });
  }
};
