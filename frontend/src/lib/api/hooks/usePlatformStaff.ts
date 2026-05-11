import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { platformClient } from "../platformClient";
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"
import { toast } from "react-toastify"
import { AxiosError } from "axios";

export const usePlatformStaffList = (page: number = 1, limit: number = 10) => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-staff-list", page, limit],
        queryFn: async () => {
            const { data } = await platformClient.get<Record<string, unknown>>(`/platform/staff?page=${page}&limit=${limit}`, {
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
        mutationFn: async (staffData: Record<string, unknown>) => {
            const { data } = await platformClient.post<{ message: string }>("/platform/staff", staffData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-staff-list"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to create staff")
        }
    })
}

export const useUpdateStaffRole = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, role }: { id: string, role: string }) => {
            const { data } = await platformClient.patch<{ message: string }>(`/platform/staff/${id}/role`, { role }, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-staff-list"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to update role")
        }
    })
}

export const useResetStaffCredentials = () => {
    const { platform_token } = usePlatformStaffStore()

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await platformClient.post<{ message: string }>(`/platform/staff/${id}/reset`, {}, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to dispatch reset email")
        }
    })
}
