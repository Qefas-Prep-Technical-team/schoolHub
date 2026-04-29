import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { toast } from "react-toastify";

export const useSupportTickets = () => {
    return useQuery({
        queryKey: ["my-support-tickets"],
        queryFn: async () => {
            const { data } = await apiClient.get("/support/tickets");
            return data.data;
        }
    });
};

export const useTicketMessages = (ticketId?: string) => {
    return useQuery({
        queryKey: ["ticket-messages", ticketId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/support/tickets/${ticketId}/messages`);
            return data.data;
        },
        enabled: !!ticketId
    });
};

export const useCreateTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { subject: string; category?: string; priority?: string; description: string }) => {
            const { data } = await apiClient.post("/support/tickets", payload);
            return data.data;
        },
        onSuccess: () => {
            toast.success("Support ticket created!");
            queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
        },
        onError: () => {
            toast.error("Failed to create ticket. Please try again.");
        }
    });
};

export const useSendTicketMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ ticketId, content }: { ticketId: string; content: string }) => {
            const { data } = await apiClient.post(`/support/tickets/${ticketId}/messages`, { content });
            return data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["ticket-messages", variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
        },
        onError: () => {
            toast.error("Failed to send message.");
        }
    });
};
