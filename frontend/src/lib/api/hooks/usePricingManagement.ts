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
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-pricing-plans"] })
            queryClient.invalidateQueries({ queryKey: ["fetchPricing"] }) // Global invalidation
            toast.success("Pricing plan updated successfully")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to save plan")
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
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-pricing-plans"] })
            toast.success(res.message)
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
