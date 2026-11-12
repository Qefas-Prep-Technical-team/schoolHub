import { Router, Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../../middleware/authMiddleware";
import prisma, { withRetry } from "../../config/database";

const router = Router();

/**
 * Optional authentication middleware for checkout endpoints that support both
 * logged-in users and guest onboarding checkouts.
 */
const optionalAuthenticateToken = async (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    try {
        const authHeader = req.header("Authorization");
        const bearerToken = authHeader?.startsWith("Bearer ")
            ? authHeader.replace("Bearer ", "")
            : undefined;
        const token = bearerToken || req.cookies?.token;
        if (!token || !process.env.JWT_ACCESS_SECRET) {
            return next();
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as {
            userId?: string;
            userType?: string;
        };
        if (decoded?.userId && decoded?.userType) {
            let schoolId: string | undefined;
            let adminRole: string | undefined;
            if (decoded.userType === "ADMIN") {
                const sa = await withRetry(
                    () =>
                        prisma.schoolAdmin.findFirst({
                            where: { adminId: decoded.userId, active: true },
                            select: { schoolId: true, role: true },
                        }),
                    "payment.optionalAuth.schoolAdmin",
                );
                schoolId = sa?.schoolId;
                adminRole = sa?.role;
            }
            req.user = {
                id: decoded.userId,
                userId: decoded.userId,
                userType: decoded.userType,
                role: decoded.userType,
                schoolId,
                adminRole,
            };
        }
    } catch {
        // Proceed as guest if token is absent or expired during onboarding checkout
    }
    return next();
};

// Rate limiter for payment initialization (prevent spamming Paystack)
const paymentInitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 initializations per hour
    message: { success: false, message: "Too many payment attempts. Please try again in an hour." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for verification (prevent brute-forcing references)
const paymentVerifyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 verifications per hour
    message: { success: false, message: "Too many verification attempts. Please contact support if you have issues." },
    standardHeaders: true,
    legacyHeaders: false,
});

import {
    initializePayment,
    verifyPayment,
    getPaymentHistory,
    getPricingPlans,
    getPricingFAQ,
    getUserBilling,
    paystackWebhook,
    scheduleDowngrade,
    cancelDowngrade
} from "./payment.controller";

import {
    validateCoupon
} from "./coupon.controller";

/**
 * @route   GET /api/v1/payment/plans
 * @desc    Get all pricing plans
 * @access  Public
 */
router.get("/plans", getPricingPlans);

/**
 * @route   GET /api/v1/payment/faq
 * @desc    Get pricing FAQs
 * @access  Public
 */
router.get("/faq", getPricingFAQ);

/**
 * @route   POST /api/v1/payment/initialize
 * @desc    Initialize a payment transaction
 * @access  Public / Optional Auth (Guest support needed for checkout)
 */
router.post("/initialize", paymentInitLimiter, optionalAuthenticateToken, initializePayment);

/**
 * @route   POST /api/v1/payment/verify
 * @desc    Verify a payment transaction from Paystack
 * @access  Public / Optional Auth (Guest support needed for checkout)
 */
router.post("/verify", paymentVerifyLimiter, optionalAuthenticateToken, verifyPayment);

/**
 * @route   POST /api/v1/payment/webhook
 * @desc    Handle Paystack Webhook events
 * @access  Public (Verified via signature)
 */
router.post("/webhook", paystackWebhook);

/**
 * @route   POST /api/v1/payment/coupon/validate
 * @desc    Validate a coupon code and return discount info (no usage recorded)
 * @access  Public
 */
router.post("/coupon/validate", validateCoupon);

// Authentication required for the following routes
router.use(authenticateToken);

/**
 * @route   GET /api/v1/payment/billing
 * @desc    Get subscription and billing data for the current user
 * @access  Private
 */
router.get("/billing", getUserBilling);

/**
 * @route   POST /api/v1/payment/schedule-downgrade
 * @desc    Schedule a plan downgrade at end of billing period (no charge)
 * @access  Private
 */
router.post("/schedule-downgrade", scheduleDowngrade);

/**
 * @route   DELETE /api/v1/payment/schedule-downgrade
 * @desc    Cancel a previously scheduled downgrade
 * @access  Private
 */
router.delete("/schedule-downgrade", cancelDowngrade);

/**
 * @route   GET /api/v1/payment/history
 * @desc    Get payment history for the authenticated user
 * @access  Private
 */
router.get("/history", getPaymentHistory);

export default router;
