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
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const { reference, plan, billingType } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Transaction reference is required",
      });
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

/**
 * Get all pricing plans
 */
export const getPricingPlans = async (req: Request, res: Response) => {
  return res.status(200).json(PRICING_PLANS);
};

/**
 * Get pricing FAQs
 */
export const getPricingFAQ = async (req: Request, res: Response) => {
  return res.status(200).json(PRICING_FAQ);
};
