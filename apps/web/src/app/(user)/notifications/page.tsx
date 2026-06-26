"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { notificationService } from "@/services/notification.service";
import { useNotificationStore } from "@/stores/notification.store";
import { Notification } from "@/types/notification.types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const TYPE_ICON: Record<string, string> = {
  BOOKING_CONFIRMED: "🎫",
  BOOKING_FAILED: "❌",
  EVENT_CANCELLED: "📢",
  ORGANIZER_APPROVED: "🎉",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { setUnreadCount } = useNotificationStore();

  const fetchNotifications = () => {
    notificationService
      .getNotifications({ page, limit: 15 })
      .then((res) => {
        setNotifications(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    notificationService
      .getUnreadCount()
      .then((res) => setUnreadCount(res.count));
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-[var(--color-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Thông báo
          </h1>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline"
        >
          <CheckCheck size={16} />
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 animate-pulse border border-[var(--color-cream-dark)]"
            >
              <div className="h-4 bg-[var(--color-cream-dark)] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[var(--color-cream-dark)] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl">🔔</span>
          <p className="text-[var(--color-text-muted)] mt-4 text-lg">
            Chưa có thông báo nào
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                notification.isRead
                  ? "border-[var(--color-cream-dark)]"
                  : "border-[var(--color-primary)]/30 bg-[var(--color-cream)]"
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl shrink-0">
                  {TYPE_ICON[notification.type] || "🔔"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`font-semibold text-sm ${
                        notification.isRead
                          ? "text-[var(--color-text-muted)]"
                          : "text-[var(--color-text)]"
                      }`}
                    >
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="shrink-0 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                  {notification.body && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
                      {notification.body}
                    </p>
                  )}
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    {format(
                      new Date(notification.createdAt),
                      "dd/MM/yyyy HH:mm",
                      { locale: vi },
                    )}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0 mt-1.5" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-[var(--color-cream-dark)] text-[var(--color-text-muted)] disabled:opacity-40 hover:border-[var(--color-primary)] transition-colors"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl font-medium transition-all ${
                p === page
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-[var(--color-cream-dark)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border border-[var(--color-cream-dark)] text-[var(--color-text-muted)] disabled:opacity-40 hover:border-[var(--color-primary)] transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
