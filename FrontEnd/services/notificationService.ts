import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { RecurringTransaction } from '../types/transaction';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  /**
   * Request permission to send notifications
   */
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // For Android, set notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('recurring-transactions', {
        name: 'Recurring Transactions',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7f3dff',
      });
    }

    return true;
  },

  /**
   * Schedule a notification for a recurring transaction
   */
  async scheduleRecurringNotification(
    recurring: RecurringTransaction
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const nextDate = new Date(recurring.nextDate);
      const notifyDate = new Date(nextDate);
      
      // Notify X days before (default 1 day)
      const daysBefore = recurring.notifyBefore || 1;
      notifyDate.setDate(notifyDate.getDate() - daysBefore);

      // Don't schedule if the notification time has passed
      if (notifyDate <= new Date()) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${recurring.type === 'income' ? '💰' : '💸'} ${recurring.name}`,
          body: `${this.formatCurrency(recurring.amount)} sẽ được ${
            recurring.autoCreate ? 'tự động tạo' : 'đến hạn'
          } vào ${this.formatDate(nextDate)}`,
          data: {
            recurringId: recurring.id,
            type: 'recurring-reminder',
          },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notifyDate,
          channelId: Platform.OS === 'android' ? 'recurring-transactions' : undefined,
        } as any,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  /**
   * Cancel all notifications for a recurring transaction
   */
  async cancelRecurringNotifications(recurringId: string): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel = scheduled.filter(
        (n) => n.content.data?.recurringId === recurringId
      );

      for (const notification of toCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling recurring notifications:', error);
    }
  },

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },

  /**
   * Send immediate notification (for testing or manual triggers)
   */
  async sendImmediateNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  },

  /**
   * Reschedule all active recurring notifications
   */
  async rescheduleAllRecurringNotifications(
    recurringTransactions: RecurringTransaction[]
  ): Promise<void> {
    const active = recurringTransactions.filter(r => r.isActive);
    
    for (const recurring of active) {
      // Cancel existing notifications for this recurring transaction
      await this.cancelRecurringNotifications(recurring.id);
      
      // Schedule new notification
      if (recurring.notifyBefore && recurring.notifyBefore > 0) {
        await this.scheduleRecurringNotification(recurring);
      }
    }
  },

  // Helper functions
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  },

  formatDate(date: Date): string {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  },
};
