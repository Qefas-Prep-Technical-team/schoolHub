import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { platformClient } from "../platformClient";
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"
import { toast } from "react-toastify"

/**
 * Hook for platform staff to manage pricing plans
 */
export const usePlatformPricingPlans = () => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-pricing-plans"],
        queryFn: async () => {
            const { data } = await platformClient.get("/platform/pricing/all", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data; // Grouped structure from PricingService.resolveAllPlans
        },
        enabled: !!platform_token,
    })
}

/**
 * Mutate (Save/Update) a pricing plan
 */
export const useSavePricingPlan = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (planData: any) => {
            const { data } = await platformClient.post("/platform/pricing/save", planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: async () => {
            // Force immediate refetch
            await queryClient.invalidateQueries({ queryKey: ["platform-pricing-plans"] });
            await queryClient.invalidateQueries({ queryKey: ["fetchPricing"] });
            toast.success("Pricing plan updated successfully");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to save plan");
        }
    })
}

/**
 * Seed plans from hardcoded constants or frontend data
 */
export const useSeedPricingPlans = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload?: { plans: any[] }) => {
            const { data } = await platformClient.post("/platform/pricing/seed", payload || {}, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ["platform-pricing-plans"] })
            toast.success(res.message || "Plans seeded successfully")
        }
    })
}

/**
 * Fetch hardcoded default plans
 */
export const usePlatformPricingDefaults = () => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-pricing-defaults"],
        queryFn: async () => {
            const { data } = await platformClient.get("/platform/pricing/defaults", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    })
}

/**
 * Fetch all features from the manifest
 */
export const usePlatformFeatures = () => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-features-manifest"],
        queryFn: async () => {
            const { data } = await platformClient.get("/platform/pricing/features/manifest", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            if (!data.success) throw new Error(data.message || "Failed to fetch platform features");
            return data.data;
        },
        enabled: !!platform_token,
    })
}

/**
 * Save or update a feature in the manifest
 */
export const useSavePlatformFeature = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (featureData: any) => {
            const { data } = await platformClient.post("/platform/pricing/features/save", featureData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["platform-features-manifest"] })
            queryClient.invalidateQueries({ queryKey: ["platform-features"] })
            toast.success("Feature manifest updated")
        }
    })
}
/**
 * Fetch billing dashboard stats
 */
export const usePlatformBillingStats = () => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-billing-stats"],
        queryFn: async () => {
            const { data } = await platformClient.get("/platform/pricing/stats", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    })
}

/**
 * Harvest legacy features and sync to manifest
 */
export const useHarvestFeatures = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload?: { category?: string, role?: string }) => {
            const { data } = await platformClient.post("/platform/pricing/features/harvest", payload || {}, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ["platform-features-manifest"] })
            queryClient.invalidateQueries({ queryKey: ["platform-features"] })
            queryClient.invalidateQueries({ queryKey: ["platform-pricing-plans"] })
            toast.success(res.message)
        }
    })
}
