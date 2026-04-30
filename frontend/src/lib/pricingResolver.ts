import { PricingData } from "../components/Types/Pricing";


/**
 * Resolver for frontend pricing data.
 * Merges API data with fallback constants.
 */
export const pricingResolver = (apiData: any): PricingData[] => {
    // Pure DB truth - return only what comes from the API
    if (Array.isArray(apiData) && apiData.length > 0) {
        return apiData as PricingData[];
    }
    
    return [];
};
