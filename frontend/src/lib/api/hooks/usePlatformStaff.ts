import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { platformClient } from "../platformClient";
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"
import { toast } from "react-toastify"

export const usePlatformStaffList = (page: number = 1, limit: number = 10) => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-staff-list", page, limit],
        queryFn: async () => {
            const { data } = await platformClient.get(`/platform/staff?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        enabled: !!platform_token,
    })
}

export const useCreateStaff = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (staffData: any) => {
            const { data } = await platformClient.post("/platform/staff", staffData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-staff-list"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to create staff")
        }
    })
}

export const useUpdateStaffRole = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, role }: { id: string, role: string }) => {
            const { data } = await platformClient.patch(`/platform/staff/${id}/role`, { role }, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-staff-list"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update role")
        }
    })
}

export const useResetStaffCredentials = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await platformClient.post(`/platform/staff/${id}/reset`, {}, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            toast.success(res.message)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to dispatch reset email")
        }
    })
}
