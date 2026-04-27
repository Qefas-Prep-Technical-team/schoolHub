import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { platformClient } from "../platformClient"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"
import { toast } from "react-toastify"

export const usePlatformPlans = () => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-plans"],
        queryFn: async () => {
            const { data } = await platformClient.get("/platform/billing/plans", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    })
}

export const useUpdatePlatformPlan = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, planData }: { id: string, planData: any }) => {
            const { data } = await platformClient.put(`/platform/billing/plans/${id}`, planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-plans"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update plan")
        }
    })
}

export const useCreatePlatformPlan = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (planData: any) => {
            const { data } = await platformClient.post("/platform/billing/plans", planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-plans"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to create plan")
        }
    })
}

export const useAssignSchoolPlan = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: { schoolId: string, planId: string, status: string, endDate?: string }) => {
            const { data } = await platformClient.post(`/platform/billing/assign`, payload, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-schools"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to assign plan")
        }
    })
}
