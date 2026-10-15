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
            queryClient.setQueryData(["ticket-messages", variables.ticketId], (old: { messages?: Record<string, unknown>[] } | undefined) => {
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

export interface ComplianceTicket {
  id: string;
  category: "COMPLIANCE_DATA_DELETION" | "COMPLIANCE_ACCOUNT_DEACTIVATION" | string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  subject: string;
  description: string;
  userType?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export interface DeactivatedUserRecord {
  id: string;
  name: string;
  email: string;
  code: string;
  role: "STUDENT" | "TEACHER" | "ADMIN" | "PARENT";
  status: string;
  isActive: boolean;
  deactivatedAt: string;
  createdAt: string;
  schoolName: string | null;
}

export interface ComplianceSummary {
  totalDeletionRequests: number;
  pendingDeletionRequests: number;
  totalDeactivationTickets: number;
  totalDeactivatedUsers: number;
  totalStudentsDeactivated: number;
  totalTeachersDeactivated: number;
  totalAdminsDeactivated: number;
  totalParentsDeactivated: number;
}

export interface ComplianceResponseData {
  tickets: ComplianceTicket[];
  deactivatedUsers: DeactivatedUserRecord[];
  summary: ComplianceSummary;
}

export const usePlatformComplianceRequests = (params?: {
  category?: string;
  status?: string;
  search?: string;
  role?: string;
}) => {
  const { platform_token } = usePlatformStaffStore();

  return useQuery<ComplianceResponseData>({
    queryKey: ["compliance-requests", params],
    queryFn: async () => {
      const { data } = await platformClient.get<{ success: boolean; data: ComplianceResponseData }>(
        "/platform/support/compliance-requests",
        {
          params,
          headers: { Authorization: `Bearer ${platform_token}` },
        }
      );
      return data.data;
    },
    enabled: !!platform_token,
    staleTime: 1000 * 60 * 2,
  });
};

