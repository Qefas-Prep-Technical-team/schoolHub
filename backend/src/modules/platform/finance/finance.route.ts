import { Router } from "express";
import { listAllTransactions, getPlatformRevenue, getSettlementStatus } from "./finance.controller";
import { authenticatePlatformStaff, authorizePlatformRole } from "../../../middleware/platformAuthMiddleware";

const router = Router();

router.use(authenticatePlatformStaff);

/**
 * @route   GET /api/platform/finance/transactions
 */
router.get("/transactions", authorizePlatformRole(["OWNER", "FINANCE_ADMIN"]), listAllTransactions);

/**
 * @route   GET /api/platform/finance/revenue
 */
router.get("/revenue", authorizePlatformRole(["OWNER", "FINANCE_ADMIN"]), getPlatformRevenue);

/**
 * @route   GET /api/platform/finance/settlements
 */
router.get("/settlements", authorizePlatformRole(["OWNER", "FINANCE_ADMIN"]), getSettlementStatus);

export default router;
