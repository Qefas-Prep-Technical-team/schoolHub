import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { platformClient } from "../platformClient"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"
import { toast } from "react-toastify"

export const usePlatformTickets = () => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-tickets"],
        queryFn: async () => {
            const { data } = await platformClient.get("/platform/support/global-stats", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    })
}
