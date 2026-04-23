import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { 
    initializePayment, 
    verifyPayment, 
    getPaymentHistory,
    getPricingPlans,
    getPricingFAQ
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

// Authentication required for the following routes
router.use(authenticateToken);

/**
 * @route   POST /api/v1/payment/initialize
 * @desc    Initialize a payment transaction
 * @access  Private
 */
router.post("/initialize", initializePayment);

/**
 * @route   POST /api/v1/payment/verify
 * @desc    Verify a payment transaction from Paystack
 * @access  Private
 */
router.post("/verify", verifyPayment);

/**
 * @route   GET /api/v1/payment/history
 * @desc    Get payment history for the authenticated user
 * @access  Private
 */
router.get("/history", getPaymentHistory);

export default router;
