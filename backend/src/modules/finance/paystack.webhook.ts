import { Request, Response } from "express";
import crypto from "crypto";
import { FinanceService } from "./finance.service";
import { handleError } from "../../utils/error-handler";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

/**
 * @deprecated
 * This webhook handler is superseded by the UNIFIED Paystack webhook at:
 *   POST /api/v1/payment/webhook  (payment.service.ts → paystackWebhookService)
 *
 * That endpoint handles ALL Paystack events:
 *   - charge.success (subscription auto-renewals)
 *   - charge.success where paymentType === "SCHOOL_FEES" → delegated to FinanceService
 *   - subaccount.update → delegated to FinanceService
 *
 * Only ONE webhook URL may be registered in the Paystack Dashboard.
 * Register: https://your-domain.com/api/v1/payment/webhook
 * Do NOT register /api/v1/finance/webhook — this handler is not called in production.
 */
export const paystackWebhookHandler = async (req: Request, res: Response) => {
  try {
    // Validate Paystack signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.warn("[Paystack Webhook] Invalid signature received");
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    // Handle successful charges
    if (event.event === "charge.success") {
      const { reference } = event.data;
      const metadata = event.data.metadata;

      // Only process if it's a school fee payment
      if (metadata && metadata.paymentType === "SCHOOL_FEES") {
        console.log(`[Paystack Webhook] Processing school fee success: ${reference}`);
        await FinanceService.verifyPayment(reference);
      }
    } else if (event.event === "subaccount.update") {
      const { subaccount_code, status } = event.data;
      console.log(`[Paystack Webhook] Subaccount update: ${subaccount_code} -> ${status}`);
      await FinanceService.updateSubaccountStatusByCode(subaccount_code, status);
    }

    // Always respond with 200 to Paystack
    res.sendStatus(200);
  } catch (error: unknown) {
    return handleError(res, error, "finance.paystackWebhookHandler");
  }
};
