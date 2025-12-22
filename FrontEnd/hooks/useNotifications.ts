import { useState, useEffect, useCallback } from 'react';
import {
  notificationApiService,
  Notification,
  NotificationCategory,
} from '../services/api';

interface UseNotificationsOptions {
  autoFetch?: boolean;
  limit?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Actions
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearRead: () => Promise<void>;
}

/**
 * Hook để quản lý thông báo
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { autoFetch = true, limit = 20 } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchNotifications = useCallback(async (reset = true) => {
    setLoading(true);
    setError(null);

    const currentOffset = reset ? 0 : offset;

    try {
      const response = await notificationApiService.getNotifications({
        limit,
        offset: currentOffset,
      });

      if (response.success && response.data) {
        if (reset) {
          setNotifications(response.data.notifications);
        } else {
          setNotifications((prev) => [...prev, ...response.data!.notifications]);
        }
        setUnreadCount(response.data.unreadCount);
        setHasMore(response.data.hasMore);
        setOffset(currentOffset + response.data.notifications.length);
      } else {
        setError(response.message || 'Không thể tải thông báo');
      }
    } catch {
      setError('Đã xảy ra lỗi khi tải thông báo');
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    if (autoFetch) {
      fetchNotifications(true);
    }
  }, [autoFetch]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchNotifications(false);
    }
  }, [loading, hasMore, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await notificationApiService.markAsRead(id);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      console.error('Error marking notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationApiService.markAllAsRead();
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch {
      console.error('Error marking all notifications as read');
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const notification = notifications.find((n) => n.id === id);
      const response = await notificationApiService.deleteNotification(id);
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch {
      console.error('Error deleting notification');
    }
  }, [notifications]);

  const clearRead = useCallback(async () => {
    try {
      const response = await notificationApiService.clearReadNotifications();
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => !n.isRead));
      }
    } catch {
      console.error('Error clearing read notifications');
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    refetch: () => fetchNotifications(true),
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
  };
}
