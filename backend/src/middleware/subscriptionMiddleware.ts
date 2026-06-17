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
    let isCheckingSchool = false;

    // If the user operates within a school context (Admin, or any user with a schoolId), check the School's subscription
    if (schoolId) {
        account = await prisma.school.findUnique({ where: { id: schoolId } });
        isCheckingSchool = true;
    } else {
        // Fallback to personal subscription for users not tied to a school (if applicable)
        const modelName = userType.toLowerCase();
        account = await (prisma as any)[modelName].findUnique({ where: { id } });
    }

    if (!account) {
        return res.status(404).json({ success: false, message: "Profile or School information not found." });
    }

    // 1. Identify plan and expiration status
    const planName = (account.plan || "FREE").toUpperCase();
    const isFree = planName.includes("FREE") || planName === "BASIC" || planName === "STARTER_FREE";
    const subEnd = account.subscriptionEnd ? new Date(account.subscriptionEnd) : null;
    const now = new Date();
    const isExpired = subEnd && subEnd < now;
    const isTrial = account.isTrialActive === true;

    /**
     * JUST-IN-TIME (JIT) EXPIRATION SWEEPER:
     * If the user interacts with the app after their expiration date has passed, but the cron job 
     * hasn't swept them yet, we instantly downgrade their database record asynchronously.
     */
    if (isExpired && account.subscriptionStatus === "ACTIVE") {
      const { createNotification } = require("../modules/notification/notification.service");
      const { DEFAULT_PLAN } = require("../modules/subscription/plan.constants");
      
      const targetModel = isCheckingSchool ? prisma.school : (prisma as any)[userType.toLowerCase()];
      const targetId = isCheckingSchool ? schoolId : id;

      // Fire and forget database update
      targetModel.update({
        where: { id: targetId },
        data: {
          subscriptionStatus: 'EXPIRED',
          plan: DEFAULT_PLAN.toUpperCase()
        }
      }).then(() => {
         // Also fire notification
         createNotification({
            recipientType: isCheckingSchool ? 'SCHOOL' : userType.toUpperCase(),
            recipientId: targetId,
            type: 'GENERAL',
            title: 'Subscription Expired',
            message: `Your premium subscription has expired. Your account has been securely downgraded to the Free tier. Please renew to restore premium limits and features.`,
         }).catch((e: any) => console.error("JIT Notification Error:", e));
      }).catch((e: any) => console.error("JIT Update Error:", e));
    }

    /**
     * ACCESS LOGIC:
     * - Allow if plan name contains "FREE"
     * - Allow if plan has a future expiration date
     * - Allow if NO expiration date exists and it's NOT a trial (assumes free/unlimited tier)
     * - If EXPIRED, we now ALLOW them through so they fall back to the "FREE" tier experience. 
     *   Premium features will be securely blocked by the `requireFeatureAccess` middleware.
     */
    if (isFree || (subEnd && !isExpired) || (!subEnd && !isTrial) || isExpired) {
        return next();
    }

    // 2. Handle denied access (This will now only catch specific edge cases like strict locked trials)
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
