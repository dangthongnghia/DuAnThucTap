import React from 'react';
import { View, Text, Alert } from 'react-native';
import { SettingsItem } from './SettingsItem';
import { useSettings } from '../../contexts/SettingsContext';

interface User {
  name?: string;
  email?: string;
  picture?: string;
}

interface DataManagementSectionProps {
  user: User | null;
  onExportData: () => void;
  onGoogleSignIn: () => void;
}

export const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  user,
  onExportData,
  onGoogleSignIn
}) => {
  const { isDarkMode } = useSettings();

  const handleBackupSync = () => {
    if (!user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để sử dụng tính năng sao lưu và đồng bộ.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: onGoogleSignIn },
        ]
      );
    } else {
      Alert.alert('Coming soon', 'Tính năng đang phát triển');
    }
  };

  return (
    <>
      <Text className={`text-xs font-semibold px-4 py-2 uppercase tracking-wide mt-6 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        Quản lý dữ liệu
      </Text>
      <View className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
        <SettingsItem
          icon="download-outline"
          iconColor="#14B8A6"
          iconBg="bg-teal-100"
          title="Xuất dữ liệu"
          subtitle="Excel, CSV, PDF"
          onPress={onExportData}
        />
        <SettingsItem
          icon="cloud-upload-outline"
          iconColor="#06B6D4"
          iconBg="bg-cyan-100"
          title="Sao lưu & Đồng bộ"
          subtitle={user ? "Google Drive" : "Cần đăng nhập"}
          onPress={handleBackupSync}
        />
      </View>
    </>
  );
};