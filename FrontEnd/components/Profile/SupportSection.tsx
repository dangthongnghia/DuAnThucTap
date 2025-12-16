import React from 'react';
import { View, Text, Alert } from 'react-native';
import { SettingsItem } from './SettingsItem';
import { useSettings } from '../../contexts/SettingsContext';

export const SupportSection: React.FC = () => {
  const { isDarkMode } = useSettings();

  const handleHelp = () => {
    Alert.alert('Coming soon', 'Tính năng đang phát triển');
  };

  const handleAbout = () => {
    Alert.alert(
      'EasyFin v2.0.0',
      'Smart finance, made easy\n\n© 2024 EasyFin Team\nDeveloped for Luận Án Tốt Nghiệp',
      [{ text: 'OK' }]
    );
  };

  return (
    <>
      <Text className={`text-xs font-semibold px-4 py-2 uppercase tracking-wide mt-6 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        Hỗ trợ
      </Text>
      <View className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
        <SettingsItem
          icon="help-circle-outline"
          iconColor="#6366F1"
          iconBg="bg-indigo-100"
          title="Trợ giúp"
          subtitle="FAQs & Hướng dẫn"
          onPress={handleHelp}
        />
        <SettingsItem
          icon="information-circle-outline"
          iconColor="#64748B"
          iconBg="bg-slate-100"
          title="Về EasyFin"
          subtitle="Phiên bản 2.0.0"
          onPress={handleAbout}
        />
      </View>
    </>
  );
};