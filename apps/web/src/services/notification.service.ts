import api from "@/lib/axios";
import { NotificationsResponse } from "@/types/notification.types";

export const notificationService = {
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }) => {
    const res = await api.get<NotificationsResponse>("/api/notifications", {
      params,
    });
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await api.get<{ success: boolean; count: number }>(
      "/api/notifications/unread-count",
    );
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await api.patch(`/api/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch("/api/notifications/read-all");
    return res.data;
  },
};
