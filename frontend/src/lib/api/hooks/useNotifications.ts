import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService, Notification } from "../services/notificationService";
import { toast } from "react-toastify";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (options?: any) => [...notificationKeys.all, "list", options] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};

export const useNotifications = (options?: { limit?: number; offset?: number; isRead?: boolean }) => {
  return useQuery({
    queryKey: notificationKeys.list(options),
    queryFn: () => notificationService.getNotifications(options),
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("All notifications marked as read");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to mark all as read");
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("Notification deleted");
    },
  });
};
