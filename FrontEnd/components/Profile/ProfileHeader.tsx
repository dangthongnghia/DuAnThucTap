import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

interface User {
  name?: string;
  email?: string;
  picture?: string;
}

interface ProfileHeaderProps {
  user: User | null;
  isGoogleLoading: boolean;
  onGoogleSignIn: () => void;
  request: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isGoogleLoading,
  onGoogleSignIn,
  request
}) => {
  const { isDarkMode } = useSettings();

  if (user) {
    return (
      <View className={`p-6 items-center border-b ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        {user.picture && (
          <Image
            source={{ uri: user.picture }}
            className="w-24 h-24 rounded-full mb-4"
          />
        )}
        <Text className={`text-2xl font-bold ${
          isDarkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>{user.name}</Text>
        <Text className={`mt-1 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>{user.email}</Text>
      </View>
    );
  }

  return (
    <View className={`p-6 items-center border-b ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <Ionicons name="person-outline" size={40} color={isDarkMode ? '#D1D5DB' : '#9CA3AF'} />
      </View>
      <Text className={`text-xl font-bold mb-2 ${
        isDarkMode ? 'text-gray-100' : 'text-gray-800'
      }`}>Chưa đăng nhập</Text>
      <Text className={`text-sm text-center mb-4 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        Đăng nhập để đồng bộ dữ liệu và sao lưu trên nhiều thiết bị
      </Text>
      <TouchableOpacity
        className={`px-6 py-3 rounded-xl flex-row items-center ${
          isDarkMode ? 'bg-blue-700' : 'bg-blue-600'
        }`}
        onPress={onGoogleSignIn}
        disabled={isGoogleLoading || !request}
      >
        {isGoogleLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold ml-2">Đăng nhập với Google</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};