import { apiClient } from '../client';

export type NotificationType = 'LINK_REQUEST' | 'LINK_RESPONSE' | 'SYSTEM' | 'ACADEMIC' | 'ANNOUNCEMENT' | 'MESSAGE';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: any;
  link?: string;
  linkRequestId?: string;
  isRead: boolean;
  readAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export const notificationService = {
  // Get all notifications for the current user
  getNotifications: async (options?: { limit?: number; offset?: number; isRead?: boolean; priority?: NotificationPriority }) => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.isRead !== undefined) params.append('isRead', options.isRead.toString());
    if (options?.priority) params.append('priority', options.priority);

    const response = await apiClient.get<Notification[]>(`/notifications?${params.toString()}`);
    const data = (response.data as any).data || [];
    
    // Map backend status to frontend isRead
    return data.map((n: any) => ({
      ...n,
      isRead: n.status === 'READ'
    }));
  },

  // Mark a single notification as read
  markAsRead: async (id: string) => {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },

  // Delete a notification
  deleteNotification: async (id: string) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  }
};
