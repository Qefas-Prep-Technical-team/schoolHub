import express from "express";
import { FinanceController } from "./finance.controller";
import { paystackWebhookHandler } from "./paystack.webhook";
import { authenticateToken, requireRoles } from "../../middleware/authMiddleware";

const router = express.Router();

/**
 * School Admin: Setup settlement bank details
 */
router.post("/setup/:schoolId", authenticateToken, requireRoles("ADMIN", "SUPER_ADMIN"), FinanceController.setupBank);
router.delete("/account/:accountId", authenticateToken, requireRoles("ADMIN", "SUPER_ADMIN"), FinanceController.removeSubaccount);
router.patch("/sync/:schoolId", authenticateToken, requireRoles("ADMIN", "SUPER_ADMIN"), FinanceController.syncSubaccountStatus);
router.get("/bank-history/:schoolId", authenticateToken, requireRoles("ADMIN", "SUPER_ADMIN"), FinanceController.getBankAudits);

/**
 * Parent: Initialize fee payment for a child
 */
router.post("/pay", authenticateToken, requireRoles("PARENT"), FinanceController.initializePayment);

/**
 * General: Verify a transaction status
 */
router.get("/verify/:reference", FinanceController.verifyPayment);

/**
 * General: Get list of supported banks
 */
router.get("/banks", FinanceController.getBanks);

/**
 * General: Resolve account number and name
 */
router.post("/resolve-account", FinanceController.resolveAccount);

/**
 * General / Student / Parent: Initiate transcript or session portal access payment
 */
router.post("/transcript-payment/:schoolId", authenticateToken, FinanceController.initiateTranscriptPayment);

/**
 * School Admin: Get financial analytics and recent transactions
 */
router.get("/analytics/:schoolId", authenticateToken, requireRoles("ADMIN", "SUPER_ADMIN"), FinanceController.getSchoolAnalytics);

/**
 * School Admin: Get paginated transactions with filtering
 */
router.get("/transactions/:schoolId", authenticateToken, requireRoles("ADMIN", "SUPER_ADMIN"), FinanceController.getSchoolTransactions);

/**
 * School Admin: Record manual / offline fee payment (Cash, POS, Bank Transfer)
 */
router.post("/manual-payment/:schoolId", authenticateToken, requireRoles("ADMIN", "SUPER_ADMIN"), FinanceController.recordManualPayment);

/**
 * Parent: Get personal payment history
 */
router.get("/history", authenticateToken, requireRoles("PARENT"), FinanceController.getParentHistory);

/**
 * Super Admin: Get platform-wide transactions
 */
router.get("/global-transactions", authenticateToken, requireRoles("SUPER_ADMIN"), FinanceController.getGlobalTransactions);

/**
 * Paystack Webhook Handler (Public but verified by Paystack signature)
 */
router.post("/webhook", paystackWebhookHandler);

export default router;
