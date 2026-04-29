import { useQuery } from "@tanstack/react-query";
import { platformClient } from "../platformClient";
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore";

export const usePlatformStats = () => {
    const { platform_token } = usePlatformStaffStore();

    return useQuery({
        queryKey: ["platform-stats"],
        queryFn: async () => {
            const { data } = await platformClient.get("/platform/analytics/stats", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    });
};

export const usePlatformGrowth = () => {
    const { platform_token } = usePlatformStaffStore();

    return useQuery({
        queryKey: ["platform-growth"],
        queryFn: async () => {
            const { data } = await platformClient.get("/platform/analytics/growth", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    });
};
