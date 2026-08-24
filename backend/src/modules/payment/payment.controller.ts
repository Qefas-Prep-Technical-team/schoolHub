import { Request, Response } from "express";
import { z } from "zod";
import * as paymentService from "./payment.service";
import { PRICING_PLANS, PRICING_FAQ } from "./plans.data";
import { PricingService } from "../platform/billing/pricing.service";
import { handleError } from "../../utils/error-handler";
import prisma from "../../config/database";

// ─── Zod Schemas ───────────────────────────────────────────────────────────────

const initializePaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  email: z.string().email("Invalid email address"),
  plan: z.string().min(1, "Plan cannot be empty"),
  planCode: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const verifyPaymentSchema = z.object({
  reference: z.string().min(1, "Transaction reference is required"),
  plan: z.string().optional(),
  billingType: z.enum(["monthly", "yearly"] as const).optional().default("monthly"),
});

// ─── Controllers ───────────────────────────────────────────────────────────────

/**
 * Initialize a payment
 */
export const initializePayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    const validation = initializePaymentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message || "Invalid payment information",
      });
    }

    const { amount, email, plan, planCode, metadata } = validation.data;

    const data = await paymentService.initializePaymentService({
      userId: userId || "",
      amount,
      email,
      plan,
      planCode,
      metadata,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    return handleError(res, error, "payment.initializePayment");
  }
};

/**
 * Verify a payment
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const validation = verifyPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message || "Invalid request body",
      });
    }

    const { reference, plan, billingType } = validation.data;

    // Identify user: either via Auth Token or via Paystack Metadata
    let userId = (req as Request & { user?: { id: string; userType?: string } }).user?.id;
    let userRole = (req as Request & { user?: { id: string; userType?: string } }).user?.userType;

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

    const data = await paymentService.verifyPaymentService(
      reference,
      userId,
      userRole,
      plan || "",
      billingType
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified and subscription updated",
      data,
    });
  } catch (error: any) {
    console.error("[PaymentController] verifyPayment error detailed trace:", error?.stack || error);
    return handleError(res, error, "payment.verifyPayment");
  }
};

/**
 * Schedule a plan downgrade (takes effect at period end, no charge)
 */
export const scheduleDowngrade = async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: { id: string; userType?: string } }).user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const schema = z.object({
      plan: z.string().min(1, 'Plan is required'),
      billingType: z.enum(['monthly', 'yearly'] as const).default('monthly'),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: validation.error.issues[0]?.message });
    }

    const { plan, billingType } = validation.data;
    const data = await paymentService.scheduleDowngradeService(user.id, user.userType!, plan, billingType);

    return res.status(200).json({
      success: true,
      message: `Downgrade to ${plan} scheduled. Your current plan remains active until the billing period ends.`,
      data,
    });
  } catch (error: unknown) {
    return handleError(res, error, 'payment.scheduleDowngrade');
  }
};

/**
 * Cancel a scheduled plan downgrade
 */
export const cancelDowngrade = async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: { id: string; userType?: string } }).user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Mark the PENDING_DOWNGRADE transaction as CANCELLED
    await prisma.transaction.updateMany({
      where: {
        userId: user.id,
        status: 'PENDING_DOWNGRADE',
      },
      data: { status: 'CANCELLED' }
    });

    return res.status(200).json({
      success: true,
      message: 'Scheduled downgrade has been cancelled. Your current plan will continue.',
    });
  } catch (error: unknown) {
    return handleError(res, error, 'payment.cancelDowngrade');
  }
};

/**
 * Get consolidated billing data for the user
 */
export const getUserBilling = async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: { id: string; userType?: string } }).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User information not found",
      });
    }
    const { id: userId, userType: userRole } = user;
    if (!userRole) {
      return res.status(400).json({ success: false, message: "User role is missing" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    const data = await paymentService.getUserBillingService(userId, userRole, page, limit);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    return handleError(res, error, "payment.getUserBilling");
  }
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const data = await paymentService.getPaymentHistoryService(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    return handleError(res, error, "payment.getPaymentHistory");
  }
};

/**
 * Get all pricing plans (Dynamic Resolver)
 */
export const getPricingPlans = async (req: Request, res: Response) => {
    try {
        const plans = await PricingService.resolveAllPlans();
        return res.status(200).json(plans);
    } catch (error) {
      return handleError(res, error, "payment.getPricingPlans");
    }
};

/**
 * Get pricing FAQs
 */
export const getPricingFAQ = async (_req: Request, res: Response) => {
  // Suppress unused parameter lint warning by naming it _req
  void PRICING_PLANS; // retained import usage guard
  return res.status(200).json(PRICING_FAQ);
};

/**
 * Handle Paystack Webhook (Subscription Auto-Renewals)
 */
export const paystackWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;

    if (!signature) {
      return res.status(400).send('Missing Paystack signature header');
    }

    // Pass payload as an object — JSON.stringify is handled inside the service
    await paymentService.paystackWebhookService(signature, req.body);

    return res.status(200).send('Webhook received successfully');
  } catch (error) {
    return handleError(res, error, "payment.paystackWebhook");
  }
};
