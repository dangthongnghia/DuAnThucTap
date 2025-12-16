import React from 'react';
import { View, Text, Switch } from 'react-native';
import { SettingsItem } from './SettingsItem';
import { useSettings } from '../../contexts/SettingsContext';

interface GeneralSettingsProps {
  currentLanguage: string;
  isDarkMode: boolean;
  onLanguageChange: () => void;
  onThemeChange: () => void;
  onCurrencyChange: () => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  currentLanguage,
  isDarkMode,
  onLanguageChange,
  onThemeChange,
  onCurrencyChange
}) => {
  const { isDarkMode: contextIsDarkMode } = useSettings();
  
  return (
    <>
      <Text className={`text-xs font-semibold px-4 py-2 uppercase tracking-wide ${contextIsDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Cài đặt chung
      </Text>
      <View className={contextIsDarkMode ? 'bg-gray-800' : 'bg-white'}>
        <SettingsItem
          icon="language-outline"
          iconColor="#3B82F6"
          iconBg="bg-blue-100"
          title="Ngôn ngữ"
          subtitle={currentLanguage}
          onPress={onLanguageChange}
        />
        <SettingsItem
          icon={isDarkMode ? "moon" : "sunny"}
          iconColor="#F59E0B"
          iconBg="bg-amber-100"
          title="Giao diện"
          subtitle={isDarkMode ? 'Tối' : 'Sáng'}
          showArrow={false}
          rightElement={
            <Switch
              value={isDarkMode}
              onValueChange={onThemeChange}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={isDarkMode ? '#FFFFFF' : '#F3F4F6'}
            />
          }
        />
        <SettingsItem
          icon="cash-outline"
          iconColor="#10B981"
          iconBg="bg-green-100"
          title="Đơn vị tiền tệ"
          subtitle="VND - đ"
          onPress={onCurrencyChange}
        />
      </View>
    </>
  );
};