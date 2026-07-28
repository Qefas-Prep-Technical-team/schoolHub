import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "./useRepositories";
import { NotificationRecord } from "../types/database";

export const NOTIFICATION_QUERY_KEY = ["notifications"];

export const useNotifications = (userId = "user_admin_01") => {
  const { notificationRepo } = useRepositories();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery<NotificationRecord[]>({
    queryKey: NOTIFICATION_QUERY_KEY,
    queryFn: async () => {
      return await notificationRepo.findMany({
        where: "userId = ?",
        params: [userId],
      });
    },
  });

  const unreadCountQuery = useQuery<number>({
    queryKey: ["notifications", "unread", userId],
    queryFn: async () => {
      return await notificationRepo.getUnreadCount(userId);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await notificationRepo.markAllAsRead(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread", userId] });
    },
  });

  return {
    notifications: notificationsQuery.data || [],
    unreadCount: unreadCountQuery.data || 0,
    isLoading: notificationsQuery.isLoading,
    markAllAsRead: markAllReadMutation.mutateAsync,
  };
};
