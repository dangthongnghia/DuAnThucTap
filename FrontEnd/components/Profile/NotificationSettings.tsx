import React from 'react';
import { View, Text, Switch } from 'react-native';
import { SettingsItem } from './SettingsItem';
import { useSettings } from '../../contexts/SettingsContext';

interface NotificationSettingsProps {
  notificationsEnabled: boolean;
  onNotificationChange: (enabled: boolean) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notificationsEnabled,
  onNotificationChange
}) => {
  const { isDarkMode } = useSettings();

  return (
    <>
      <Text className={`text-xs font-semibold px-4 py-2 uppercase tracking-wide mt-6 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        Thông báo
      </Text>
      <View className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
        <SettingsItem
          icon="notifications-outline"
          iconColor="#8B5CF6"
          iconBg="bg-purple-100"
          title="Thông báo"
          subtitle={notificationsEnabled ? 'Đã bật' : 'Đã tắt'}
          showArrow={false}
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={onNotificationChange}
              trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#F3F4F6'}
            />
          }
        />
      </View>
    </>
  );
};