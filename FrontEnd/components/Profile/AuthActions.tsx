import React from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

interface User {
  name?: string;
  email?: string;
  picture?: string;
}

interface AuthActionsProps {
  user: User | null;
  isGoogleLoading: boolean;
  request: any;
  onSignOut: () => void;
  onGoogleSignIn: () => void;
  logoutText: string;
}

export const AuthActions: React.FC<AuthActionsProps> = ({
  user,
  isGoogleLoading,
  request,
  onSignOut,
  onGoogleSignIn,
  logoutText
}) => {
  const { isDarkMode } = useSettings();

  if (user) {
    return (
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} mt-6 mb-8`}>
        <TouchableOpacity
          className="flex-row items-center justify-center p-4"
          onPress={onSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="ml-3 text-red-500 font-semibold text-base">{logoutText}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} mt-6 mb-8`}>
      <TouchableOpacity
        className={`flex-row items-center justify-center p-4 ${
          isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
        }`}
        onPress={onGoogleSignIn}
        disabled={isGoogleLoading || !request}
      >
        {isGoogleLoading ? (
          <ActivityIndicator color="#3B82F6" size="small" />
        ) : (
          <>
            <Ionicons name="log-in-outline" size={24} color="#3B82F6" />
            <Text className={`ml-3 font-semibold text-base ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>Đăng nhập</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};