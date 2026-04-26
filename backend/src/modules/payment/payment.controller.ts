import { Request, Response } from "express";
import * as paymentService from "./payment.service";
import { PRICING_PLANS, PRICING_FAQ } from "./plans.data";

/**
 * Initialize a payment
 */
export const initializePayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { amount, email, plan, metadata } = req.body;

    if (!amount || !email || !plan) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information",
      });
    }

    const data = await paymentService.initializePaymentService({
      userId,
      amount,
      email,
      plan,
      metadata
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Payment Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to initialize payment",
    });
  }
};

/**
 * Verify a payment
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference, plan, billingType } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Transaction reference is required",
      });
    }

    // Identify user: either via Auth Token or via Paystack Metadata
    let userId = (req as any).user?.id;
    let userRole = (req as any).user?.userType;

    // If guest, we verify the transaction first to extract the metadata we sent from the frontend
    if (!userId || !userRole) {
        console.log(`[PaymentController] Guest verification for ref: ${reference}`);
        const { userId: metadataId, userRole: metadataRole } = await paymentService.getMetadataFromReference(reference);
        userId = metadataId;
        userRole = metadataRole;
    }

    if (!userId || !userRole) {
        return res.status(400).json({ success: false, message: "Could not identify user for this transaction" });
    }

    const data = await paymentService.verifyPaymentService(reference, userId, userRole, plan, billingType);

    return res.status(200).json({
      success: true,
      message: "Payment verified and subscription updated",
      data,
    });
  } catch (error: any) {
    console.error(`[Payment Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
};

/**
 * Get consolidated billing data for the user
 */
export const getUserBilling = async (req: Request, res: Response) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User information not found",
      });
    }
    const userId = (req as any).user.id;
    const userRole = (req as any).user.userType;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    const data = await paymentService.getUserBillingService(userId, userRole, page, limit);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Payment Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch user billing data",
    });
  }
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const data = await paymentService.getPaymentHistoryService(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch payment history",
    });
  }
};

import { PricingService } from "../platform/billing/pricing.service";

/**
 * Get all pricing plans (Dynamic Resolver)
 */
export const getPricingPlans = async (req: Request, res: Response) => {
    try {
        const plans = await PricingService.resolveAllPlans();
        return res.status(200).json(plans);
    } catch (error) {
        console.error("Pricing Resolution Error:", error);
        return res.status(500).json({ success: false, message: "Error fetching pricing plans" });
    }
};

/**
 * Get pricing FAQs
 */
export const getPricingFAQ = async (req: Request, res: Response) => {
  return res.status(200).json(PRICING_FAQ);
};
