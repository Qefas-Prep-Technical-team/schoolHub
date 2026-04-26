import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { 
    initializePayment, 
    verifyPayment, 
    getPaymentHistory,
    getPricingPlans,
    getPricingFAQ,
    getUserBilling
} from "./payment.controller";

const router = Router();

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
router.post("/initialize", (req, res, next) => {
    // If authenticated, authenticateToken will populate req.user
    // If guest, it proceeds without req.user
    next();
}, initializePayment);

/**
 * @route   POST /api/v1/payment/verify
 * @desc    Verify a payment transaction from Paystack
 * @access  Public (Guest support needed for checkout)
 */
router.post("/verify", verifyPayment);

// Authentication required for the following routes
router.use(authenticateToken);

/**
 * @route   GET /api/v1/payment/billing
 * @desc    Get subscription and billing data for the current user
 * @access  Private
 */
router.get("/billing", getUserBilling);

/**
 * @route   GET /api/v1/payment/history
 * @desc    Get payment history for the authenticated user
 * @access  Private
 */
router.get("/history", getPaymentHistory);

export default router;
