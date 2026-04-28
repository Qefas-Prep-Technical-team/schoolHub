import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { platformClient } from "../platformClient"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"
import { toast } from "react-toastify"

export const usePlatformTickets = () => {
    const { platform_token } = usePlatformStaffStore();

    return useQuery({
        queryKey: ["platform-tickets"],
        queryFn: async () => {
            const { data } = await platformClient.get("/platform/support/tickets", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    });
};

export const usePlatformTicketDetails = (ticketId?: string) => {
    const { platform_token } = usePlatformStaffStore();

    return useQuery({
        queryKey: ["ticket-messages", ticketId],
        queryFn: async () => {
            const { data } = await platformClient.get(`/platform/support/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token && !!ticketId,
    });
};

export const usePlatformUpdateTicket = () => {
    const { platform_token } = usePlatformStaffStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ticketId, status, priority }: { ticketId: string; status?: string; priority?: string }) => {
            const { data } = await platformClient.patch(`/platform/support/tickets/${ticketId}/status`, { status, priority }, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        onSuccess: (_, variables) => {
            toast.success("Ticket updated successfully");
            queryClient.invalidateQueries({ queryKey: ["ticket-messages", variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ["platform-tickets"] });
        },
        onError: () => {
            toast.error("Failed to update ticket");
        }
    });
};

export const usePlatformReplyTicket = () => {
    const { platform_token } = usePlatformStaffStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ticketId, content }: { ticketId: string; content: string }) => {
            const { data } = await platformClient.post(`/platform/support/tickets/${ticketId}/messages`, { content }, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        onSuccess: (newMessage, variables) => {
            // Instantly append to local cache — message appears immediately
            queryClient.setQueryData(["ticket-messages", variables.ticketId], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    messages: [...(old.messages || []), newMessage]
                };
            });
            // Background sync for ticket list counts
            queryClient.invalidateQueries({ queryKey: ["platform-tickets"] });
        },
        onError: () => {
            toast.error("Failed to send reply");
        }
    });
};

