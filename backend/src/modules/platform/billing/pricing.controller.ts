import { Request, Response } from "express";
import { PricingService } from "./pricing.service";
import { FeatureService } from "../../subscription/feature.service";
import { createActivityLog } from "../logs/logs.controller";
import prisma from "../../../config/database";

/**
 * Console: Get hardcoded defaults
 */
export const getDefaults = async (req: Request, res: Response) => {
    try {
        const plans = await PricingService.getDefaults();
        return res.status(200).json({ success: true, data: plans });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to get defaults" });
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
        return res.status(500).json({ success: false, message: "Failed to resolve pricing plans" });
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
        return res.status(500).json({ success: false, message: "Failed to list plans" });
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
        console.error("[PricingController] savePlan error:", error);
        return res.status(500).json({ success: false, message: "Failed to save pricing plan" });
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
        return res.status(500).json({ success: false, message: "Seeding failed" });
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
        return res.status(500).json({ success: false, message: "Failed to get features" });
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
        return res.status(500).json({ success: false, message: "Failed to save feature" });
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
        return res.status(500).json({ success: false, message: "Harvesting failed" });
    }
};

/**
 * Console: Delete a feature
 */
export const deleteFeature = async (req: Request, res: Response) => {
    try {
        await FeatureService.deleteFeature(req.params.id);
        return res.status(200).json({ success: true, message: "Feature deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete feature" });
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
        return res.status(500).json({ success: false, message: "Failed to get stats" });
    }
};
