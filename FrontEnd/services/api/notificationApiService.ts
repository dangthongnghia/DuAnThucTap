import { apiClient, ApiResponse } from './apiClient';

// Interfaces
export type NotificationType = 'info' | 'warning' | 'success' | 'error';
export type NotificationCategory =
  | 'transaction'
  | 'budget'
  | 'recurring'
  | 'account'
  | 'report'
  | 'system'
  | 'reminder';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  data?: Record<string, unknown>;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface NotificationFilters {
  isRead?: boolean;
  category?: NotificationCategory;
  limit?: number;
  offset?: number;
}

/**
 * Notification Service
 */
export const notificationApiService = {
  /**
   * Lấy danh sách thông báo
   */
  async getNotifications(
    filters?: NotificationFilters
  ): Promise<ApiResponse<NotificationListResponse>> {
    const searchParams = new URLSearchParams();
    if (filters?.isRead !== undefined)
      searchParams.append('isRead', filters.isRead.toString());
    if (filters?.category) searchParams.append('category', filters.category);
    if (filters?.limit) searchParams.append('limit', filters.limit.toString());
    if (filters?.offset) searchParams.append('offset', filters.offset.toString());

    const query = searchParams.toString();
    return apiClient.get<NotificationListResponse>(
      `/notifications${query ? `?${query}` : ''}`
    );
  },

  /**
   * Lấy chi tiết thông báo
   */
  async getNotification(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.get<Notification>(`/notifications/${id}`);
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadCount(): Promise<number> {
    const response = await this.getNotifications({ isRead: false, limit: 1 });
    return response.success && response.data ? response.data.unreadCount : 0;
  },

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.patch<Notification>(`/notifications/${id}`, { isRead: true });
  },

  /**
   * Đánh dấu thông báo chưa đọc
   */
  async markAsUnread(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.patch<Notification>(`/notifications/${id}`, { isRead: false });
  },

  /**
   * Đánh dấu tất cả đã đọc
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.patch<void>('/notifications', { action: 'mark-all-read' });
  },

  /**
   * Xóa thông báo
   */
  async deleteNotification(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.delete<Notification>(`/notifications/${id}`);
  },

  /**
   * Xóa tất cả thông báo đã đọc
   */
  async clearReadNotifications(): Promise<ApiResponse<void>> {
    return apiClient.patch<void>('/notifications', { action: 'clear-all' });
  },

  /**
   * Xóa tất cả thông báo
   */
  async deleteAllNotifications(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/notifications');
  },

  /**
   * Tạo thông báo (dùng cho testing hoặc local notifications)
   */
  async createNotification(
    data: CreateNotificationRequest
  ): Promise<ApiResponse<Notification>> {
    return apiClient.post<Notification>('/notifications', data);
  },
};
