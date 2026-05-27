import { Request, Response } from "express";
import { PricingService } from "./pricing.service";
import { FeatureService } from "../../subscription/feature.service";
import { createActivityLog } from "../logs/logs.controller";
import prisma from "../../../config/database";
import { handleError } from "../../../utils/error-handler";

/**
 * Console: Get hardcoded defaults
 */
export const getDefaults = async (req: Request, res: Response) => {
    try {
        const plans = await PricingService.getDefaults();
        return res.status(200).json({ success: true, data: plans });
    } catch (error) {
    return handleError(res, error, "billing.getDefaults");
  }
};

/**
 * Public: Resolve all plans (DB-first with fallback)
 */
export const getDynamicPlans = async (req: Request, res: Response) => {
    try {
        const plans = await PricingService.resolveAllPlans();
        return res.status(200).json(plans);
    } catch (error) {
    return handleError(res, error, "billing.getDynamicPlans");
  }
};

/**
 * Console: List all raw plans for management
 */
export const listAllPlans = async (req: Request, res: Response) => {
    try {
        const plans = await PricingService.resolveAllPlans(); 
        // Note: For management, we might want a flatter list, 
        // but resolveAllPlans returns the grouped structure needed by UI.
        return res.status(200).json({ success: true, data: plans });
    } catch (error) {
    return handleError(res, error, "billing.listAllPlans");
  }
};

/**
 * Console: Create or update a plan
 */
export const savePlan = async (req: Request, res: Response) => {
    try {
        const plan = await PricingService.savePlan(req.body);
        
        const loggingStaff = (req as any).staff;
        if (loggingStaff) {
            await createActivityLog(
                loggingStaff.id,
                req.body.id ? "UPDATE_PRICING_PLAN" : "CREATE_PRICING_PLAN",
                "SubscriptionPlan",
                plan.id,
                { planName: plan.name, category: plan.category }
            );
        }

        return res.status(200).json({ success: true, data: plan });
    } catch (error) {
    return handleError(res, error, "billing.savePlan");
  }
};

/**
 * Console: Seed from constants
 */
export const seedPlans = async (req: Request, res: Response) => {
    try {
        const { plans } = req.body;
        const result = await PricingService.seedFromConstants(plans);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
    return handleError(res, error, "billing.seedPlans");
  }
};

/**
 * Console: List all features from manifest
 */
export const getFeatures = async (req: Request, res: Response) => {
    try {
        let features = await FeatureService.listFeatures();
        
        // Map featureKey to tag for frontend compatibility
        const mappedFeatures = features.map((f: any) => ({
            ...f,
            tag: f.featureKey
        }));
        
        return res.status(200).json({ success: true, data: mappedFeatures });
    } catch (error) {
    return handleError(res, error, "billing.getFeatures");
  }
};

/**
 * Console: Create or update a feature
 */
export const saveFeature = async (req: Request, res: Response) => {
    try {
        const feature = await FeatureService.saveFeature(req.body);
        return res.status(200).json({ success: true, data: feature });
    } catch (error) {
    return handleError(res, error, "billing.saveFeature");
  }
};

/**
 * Console: Harvest and sync legacy features to manifest
 */
export const harvestFeatures = async (req: Request, res: Response) => {
    try {
        const result = await PricingService.harvestLegacyFeatures();
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
    return handleError(res, error, "billing.harvestFeatures");
  }
};

/**
 * Console: Delete a feature
 */
export const deleteFeature = async (req: Request, res: Response) => {
    try {
        await FeatureService.deleteFeature(req.params.id as string);
        return res.status(200).json({ success: true, message: "Feature deleted" });
    } catch (error) {
    return handleError(res, error, "billing.deleteFeature");
  }
};
/**
 * Console: Get dashboard stats
 */
export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await PricingService.getBillingStats();
        return res.status(200).json({ success: true, data: stats });
    } catch (error) {
    return handleError(res, error, "billing.getStats");
  }
};
