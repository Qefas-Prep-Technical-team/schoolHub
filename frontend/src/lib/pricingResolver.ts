import { PricingData } from "../components/Types/Pricing";
import { PRICING_PLANS } from "./constants/plansData"; // Shared from frontend constants fallback

/**
 * Resolver for frontend pricing data.
 * Merges API data with fallback constants.
 */
export const pricingResolver = (apiData: any): PricingData[] => {
    // If apiData is a non-empty array, use it.
    // Otherwise fallback to PRICING_PLANS.
    if (Array.isArray(apiData) && apiData.length > 0) {
        return apiData as PricingData[];
    }
    
    console.log("[PricingResolver] Using fallback PRICING_PLANS");
    return PRICING_PLANS as unknown as PricingData[];
};
