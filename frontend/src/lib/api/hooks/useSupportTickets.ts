import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { toast } from "react-toastify";

export interface SupportTicketMessage {
    id: string;
    ticketId: string;
    content: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    senderImage?: string | null;
    createdAt: string;
}

export interface SupportTicketItem {
    id: string;
    subject: string;
    description: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    category?: string | null;
    userType: string;
    userId: string;
    userName: string;
    userEmail: string;
    schoolName?: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: { messages: number };
    messages?: SupportTicketMessage[];
    assignedAgent?: {
        name: string;
        image?: string | null;
    } | null;
}

export const useSupportTickets = () => {
    return useQuery<SupportTicketItem[]>({
        queryKey: ["my-support-tickets"],
        queryFn: async () => {
            const { data } = await apiClient.get<{ success: boolean; data: SupportTicketItem[] }>("/support/tickets");
            return data.data;
        },
        staleTime: 1000 * 60 * 2,
        retry: 1,
    });
};

export const useTicketMessages = (ticketId?: string) => {
    return useQuery<SupportTicketMessage[]>({
        queryKey: ["ticket-messages", ticketId],
        queryFn: async () => {
            const { data } = await apiClient.get<{
                success: boolean;
                data: SupportTicketMessage[] | { messages?: SupportTicketMessage[] };
            }>(`/support/tickets/${ticketId}/messages`);

            if (data?.data && typeof data.data === "object" && "messages" in data.data && Array.isArray(data.data.messages)) {
                return data.data.messages;
            }
            if (Array.isArray(data?.data)) {
                return data.data;
            }
            return [];
        },
        enabled: !!ticketId,
        staleTime: 1000 * 30,
        retry: 1,
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
