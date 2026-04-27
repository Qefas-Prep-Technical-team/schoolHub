import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { platformClient } from "../platformClient"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"
import { toast } from "react-toastify"

export const usePlatformSchools = (query: string = "") => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-schools", query],
        queryFn: async () => {
            const { data } = await platformClient.get(`/platform/support/schools?query=${query}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    })
}

export const useUpdateSchoolStatus = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const { data } = await platformClient.patch(`/platform/schools/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-schools"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update school status")
        }
    })
}

export const useImpersonateAdmin = () => {
    const { platform_token } = usePlatformStaffStore()

    return useMutation({
        mutationFn: async (schoolId: string) => {
            const { data } = await platformClient.post(`/platform/support/impersonate/${schoolId}`, {}, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (data) => {
            toast.success(`Access tunnel established for ${data.adminName}`)
            // Open dashboard in new tab with token (impersonation)
            window.open(`/dashboard/admin?token=${data.token}`, "_blank")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Impersonation failed")
        }
    })
}
export const useUpdateSchoolLimits = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, limits }: { id: string, limits: any }) => {
            const { data } = await platformClient.patch(`/platform/support/schools/${id}/limits`, limits, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-schools"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update school limits")
        }
    })
}
