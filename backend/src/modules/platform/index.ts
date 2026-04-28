import { Router } from "express";
import platformAuthRoutes from "./auth/auth.route";
import platformStaffRoutes from "./staff/staff.route";
import platformAnalyticsRoutes from "./analytics/analytics.route";
import platformBillingRoutes from "./billing/billing.route";
import platformFinanceRoutes from "./finance/finance.route";
import platformSupportRoutes from "./support/support.route";
import platformMonitoringRoutes from "./monitoring/monitoring.route";
import platformSettingsRoutes from "./settings/settings.route";
import platformLogsRoutes from "./logs/logs.route";
import platformPricingRoutes from "./billing/pricing.routes";
import platformConfigRoutes from "./support/public.route";

const router = Router();

/**
 * All routes here are under /api/platform
 */

// Step E: Auth System (Isolated)
router.use("/auth", platformAuthRoutes);

// Step F: Platform modules
router.use("/staff", platformStaffRoutes);
router.use("/analytics", platformAnalyticsRoutes);
router.use("/billing", platformBillingRoutes);
router.use("/finance", platformFinanceRoutes);
router.use("/support", platformSupportRoutes);
router.use("/monitoring", platformMonitoringRoutes);
router.use("/settings", platformSettingsRoutes);
router.use("/logs", platformLogsRoutes);
router.use("/pricing", platformPricingRoutes);
router.use("/config", platformConfigRoutes);

export default router;
