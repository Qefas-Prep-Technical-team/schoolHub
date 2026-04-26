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

    // FREE plan users have access to basic features (capacity is enforced at service level)
    if (account.plan === "FREE") {
        next();
        return;
    }

    const now = new Date();
    const subEnd = account.subscriptionEnd ? new Date(account.subscriptionEnd) : null;

    if (!subEnd || subEnd < now) {
        return res.status(402).json({ 
            success: false, 
            message: account.isTrialActive ? "Your trial has expired. Please upgrade to continue." : "Your subscription has expired. Please renew to continue.",
            code: "SUBSCRIPTION_EXPIRED"
        });
    }

    // All good, proceed
    next();
  } catch (error: any) {
    console.error("[SubscriptionMiddleware] Check Error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error during subscription check." });
  }
};
