import express from "express";
import { FinanceController } from "./finance.controller";
import { paystackWebhookHandler } from "./paystack.webhook";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = express.Router();

/**
 * School Admin: Setup settlement bank details
 */
router.post("/setup/:schoolId", authenticateToken, FinanceController.setupBank);
router.delete("/account/:accountId", authenticateToken, FinanceController.removeSubaccount);
router.patch("/sync/:schoolId", authenticateToken, FinanceController.syncSubaccountStatus);

/**
 * Parent: Initialize fee payment for a child
 */
router.post("/pay", authenticateToken, FinanceController.initializePayment);

/**
 * General: Verify a transaction status
 */
router.get("/verify/:reference", FinanceController.verifyPayment);

/**
 * General: Get list of supported banks
 */
router.get("/banks", FinanceController.getBanks);

/**
 * School Admin: Get financial analytics and recent transactions
 */
router.get("/analytics/:schoolId", authenticateToken, FinanceController.getSchoolAnalytics);

/**
 * Parent: Get personal payment history
 */
router.get("/history", authenticateToken, FinanceController.getParentHistory);

/**
 * Super Admin: Get platform-wide transactions
 */
router.get("/global-transactions", authenticateToken, FinanceController.getGlobalTransactions);

/**
 * Paystack Webhook Handler (Public but verified by Paystack signature)
 */
router.post("/webhook", paystackWebhookHandler);

export default router;
