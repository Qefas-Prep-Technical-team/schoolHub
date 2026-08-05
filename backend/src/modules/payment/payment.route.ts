import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

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
 * @access  Public (Guest support needed for checkout)
 */
router.post("/initialize", paymentInitLimiter, (req, res, next) => {
    // If authenticated, authenticateToken will populate req.user
    // If guest, it proceeds without req.user
    next();
}, initializePayment);

/**
 * @route   POST /api/v1/payment/verify
 * @desc    Verify a payment transaction from Paystack
 * @access  Public (Guest support needed for checkout)
 */
router.post("/verify", paymentVerifyLimiter, verifyPayment);

/**
 * @route   POST /api/v1/payment/webhook
 * @desc    Handle Paystack Webhook events
 * @access  Public (Verified via signature)
 */
router.post("/webhook", paystackWebhook);

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
