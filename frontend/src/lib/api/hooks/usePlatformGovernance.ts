import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { platformClient } from "../platformClient"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"
import { toast } from "react-toastify"
import { AxiosError } from "axios";

export const usePlatformFinance = () => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-finance"],
        queryFn: async () => {
            const { data } = await platformClient.get<{ data: Record<string, unknown>[] }>("/platform/finance/transactions", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    })
}

export const usePlatformSettings = () => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-settings"],
        queryFn: async () => {
            const { data } = await platformClient.get<{ data: Record<string, unknown> }>("/platform/settings", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    })
}

export const usePublicPlatformSettings = () => {
    return useQuery({
        queryKey: ["public-platform-settings"],
        queryFn: async () => {
            const { data } = await platformClient.get<{ data: Record<string, unknown> }>("/platform/settings/public");
            return data.data;
        }
    })
}

export const useUpdatePlatformSettings = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (settings: Record<string, unknown>) => {
            const { data } = await platformClient.post<{ message: string }>("/platform/settings", settings, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-settings"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to update settings")
        }
    })
}

export const usePlatformAuditLogs = (page: number = 1, limit: number = 10) => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-audit-logs", page, limit],
        queryFn: async () => {
            const { data } = await platformClient.get<{ data: Record<string, any>[] }>(`/platform/logs?page=${page}&limit=${limit}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    })
}
