import { toast } from "react-toastify";
import { AxiosError } from "axios";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (options?: Record<string, unknown>) => [...notificationKeys.all, "list", options] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};

export const useNotifications = (options?: { limit?: number; offset?: number; isRead?: boolean; priority?: NotificationPriority }) => {
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
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      // Snapshot the previous values
      const previousNotifications = queryClient.getQueryData(notificationKeys.all);
      const previousUnreadCount = queryClient.getQueryData(notificationKeys.unreadCount());

      // Optimistically update the unread count
      queryClient.setQueryData(notificationKeys.unreadCount(), (old: { count: number } | undefined) => {
        if (!old || old.count === 0) return old;
        return { ...old, count: Math.max(0, old.count - 1) };
      });

      // Optimistically update the list(s)
      queryClient.setQueriesData({ queryKey: notificationKeys.all }, (old: unknown) => {
        if (!old) return old;
        
        // Handle list structure
        if (Array.isArray(old)) {
          return old.map((n: Notification) => 
            n.id === id ? { ...n, isRead: true } : n
          );
        }
        
        // Handle paginated structure if exists
        const oldData = old as { pages?: unknown[] };
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: unknown) => 
              Array.isArray(page) 
                ? page.map((n: Notification) => n.id === id ? { ...n, isRead: true } : n)
                : page
            )
          };
        }
        
        return old;
      });

      return { previousNotifications, previousUnreadCount };
    },
    onError: (err, id, context: { previousNotifications: unknown; previousUnreadCount: unknown } | undefined) => {
      if (context) {
        queryClient.setQueryData(notificationKeys.all, context.previousNotifications);
        queryClient.setQueryData(notificationKeys.unreadCount(), context.previousUnreadCount);
      }
    },
    onSettled: () => {
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
    onError: (error: AxiosError<{ message?: string }>) => {
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
