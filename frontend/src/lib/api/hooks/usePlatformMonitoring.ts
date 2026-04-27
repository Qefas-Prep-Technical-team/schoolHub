import { useQuery } from "@tanstack/react-query";
import { platformClient } from "../platformClient";
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore";

export const usePlatformLogs = (limit: number = 50) => {
    const { platform_token } = usePlatformStaffStore();

    return useQuery({
        queryKey: ["platform-logs", limit],
        queryFn: async () => {
            const { data } = await platformClient.get(`/platform/monitoring/logs?limit=${limit}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    });
};

export const usePlatformHealth = () => {
    const { platform_token } = usePlatformStaffStore();

    return useQuery({
        queryKey: ["platform-health"],
        queryFn: async () => {
            const { data } = await platformClient.get("/platform/monitoring/health", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
        refetchInterval: 30000, // Refresh health every 30s
    });
};
