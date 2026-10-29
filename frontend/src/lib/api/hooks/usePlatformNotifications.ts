import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformClient } from "@/lib/api/platformClient";

export type AlertEventType = 
  | "NEW_USERS"
  | "PAYMENTS" 
  | "SUBSCRIPTIONS"
  | "COMPLAINTS" 
  | "SUGGESTIONS" 
  | "INQUIRIES" 
  | "SYSTEM_ALERTS";

export interface AlertRecipient {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  events: AlertEventType[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipientPayload {
  name: string;
  email: string;
  role?: string;
  events: AlertEventType[];
  isActive?: boolean;
}

export interface UpdateRecipientPayload {
  name?: string;
  email?: string;
  role?: string;
  events?: AlertEventType[];
  isActive?: boolean;
}

export const platformNotificationKeys = {
  all: ["platformNotifications"] as const,
  recipients: () => [...platformNotificationKeys.all, "recipients"] as const,
};

export const usePlatformRecipients = () => {
  return useQuery({
    queryKey: platformNotificationKeys.recipients(),
    queryFn: async (): Promise<AlertRecipient[]> => {
      const response = await platformClient.get<{ success: boolean; data: AlertRecipient[] }>(
        "/platform/notifications/recipients"
      );
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};

export const useCreateRecipient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRecipientPayload): Promise<AlertRecipient> => {
      const response = await platformClient.post<{ success: boolean; data: AlertRecipient }>(
        "/platform/notifications/recipients",
        payload
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformNotificationKeys.recipients() });
    },
  });
};

export const useUpdateRecipient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRecipientPayload }): Promise<AlertRecipient> => {
      const response = await platformClient.patch<{ success: boolean; data: AlertRecipient }>(
        `/platform/notifications/recipients/${id}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformNotificationKeys.recipients() });
    },
  });
};

export const useToggleRecipient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<AlertRecipient> => {
      const response = await platformClient.patch<{ success: boolean; data: AlertRecipient }>(
        `/platform/notifications/recipients/${id}/toggle`
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformNotificationKeys.recipients() });
    },
  });
};

export const useDeleteRecipient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await platformClient.delete(`/platform/notifications/recipients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformNotificationKeys.recipients() });
    },
  });
};

export const useSendTestAlert = () => {
  return useMutation({
    mutationFn: async (id: string): Promise<{ success: boolean; message: string }> => {
      const response = await platformClient.post<{ success: boolean; message: string }>(
        `/platform/notifications/recipients/${id}/test`
      );
      return response.data;
    },
  });
};
