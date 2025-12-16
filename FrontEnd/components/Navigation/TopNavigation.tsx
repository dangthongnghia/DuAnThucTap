import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';

type NavVariant = 
  | 'notification'
  | 'title-with-create'
  | 'simple-title'
  | 'avatar-dropdown-notification'
  | 'dropdown-with-sort'
  | 'dropdown-with-sort-badge'
  | 'title-with-login';

interface TopNavigationProps {
  variant: NavVariant;
  title?: string;
  dropdownText?: string;
  avatarUri?: string;
  badgeCount?: number;
  onBackPress?: () => void;
  onMorePress?: () => void;
  onCreatePress?: () => void;
  onNotificationPress?: () => void;
  onDropdownPress?: () => void;
  onSortPress?: () => void;
  onLoginPress?: () => void;
  rightButton?: React.ReactNode;
}

export default function TopNavigation({
  variant,
  title = 'Title',
  dropdownText = 'Month',
  avatarUri,
  badgeCount = 0,
  onBackPress,
  onMorePress,
  onCreatePress,
  onNotificationPress,
  onDropdownPress,
  onSortPress,
  onLoginPress,
  rightButton,
}: TopNavigationProps) {
  const { isDarkMode } = useSettings();
  const iconColor = isDarkMode ? '#000000' : '#ffffff'; // gray-200 or gray-800

const containerBaseClass = `flex-row items-center justify-between h-16 px-4 ${
  isDarkMode ? 'bg-gray-900' : 'bg-white'
}`;
  // New Variant: Title + Login Button
  if (variant === 'title-with-login') {
  return (
    <View className={containerBaseClass}>
      <View className="w-8" />{/* Spacer */}
      <Text className={`flex-1 text-center text-lg font-semibold ${
        isDarkMode ? 'text-gray-200' : 'text-gray-800'
      }`}>{title}</Text>
      <TouchableOpacity onPress={onLoginPress} className="p-1">
        <Text className={`text-base font-semibold ${
          isDarkMode ? 'text-violet-400' : 'text-violet-500'
        }`}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

  // Variant 1: Back + Title + More
if (variant === 'notification') {
  return (
    <View className={containerBaseClass}>
      <TouchableOpacity onPress={onBackPress} className="p-1">
        <Ionicons name="arrow-back" size={32} color={iconColor} />
      </TouchableOpacity>
      <Text className={`flex-1 text-center text-lg font-semibold ${
        isDarkMode ? 'text-gray-200' : 'text-gray-800'
      }`}>{title}</Text>
      <TouchableOpacity onPress={onMorePress} className="p-1">
        <Ionicons name="ellipsis-horizontal" size={32} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

  // Variant 2: Back + Title + Create
if (variant === 'title-with-create') {
  return (
    <View className={containerBaseClass}>
      <TouchableOpacity onPress={onBackPress} className="p-1">
        <Ionicons name="arrow-back" size={32} color={iconColor} />
      </TouchableOpacity>
      <Text className={`flex-1 text-center text-lg font-semibold ${
        isDarkMode ? 'text-gray-200' : 'text-gray-800'
      }`}>{title}</Text>
      <TouchableOpacity onPress={onCreatePress} className="p-1">
        <Ionicons name="add-circle-outline" size={32} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

  // Variant 3: Simple Title Only (Used on colored background)
if (variant === 'simple-title') {
  return (
    <View className="flex-row items-center justify-between h-16 px-4 bg-transparent">
      <TouchableOpacity onPress={onBackPress} className="p-1">
        <Ionicons name="arrow-back" size={32} color="white" />
      </TouchableOpacity>
      <Text className="flex-1 text-center text-lg font-semibold text-white">{title}</Text>
      <View className="w-10">
        {rightButton || <View />}
      </View>
    </View>
  );
}

  // Variant 4: Avatar + Dropdown + Notification
  if (variant === 'avatar-dropdown-notification') {
  return (
    <View className="flex-row items-center justify-between h-16 px-4 bg-transparent py-2">
      <View className="w-8 h-8 rounded-full overflow-hidden">
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} className="w-full h-full" />
        ) : (
          <View className={`w-full h-full items-center justify-center ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <Ionicons name="person" size={20} color={iconColor} />
          </View>
        )}
      </View>

      <TouchableOpacity 
        className={`flex-row items-center gap-1 px-3 py-2 rounded-full border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`} 
        onPress={onDropdownPress}
      >
        <Ionicons name="chevron-down" size={24} color={iconColor} />
        <Text className={`text-sm font-medium ${
          isDarkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>{dropdownText}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onNotificationPress} className="p-1">
        <Ionicons name="notifications-outline" size={32} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

  // Variant 5: Dropdown + Sort
  if (variant === 'dropdown-with-sort') {
  return (
    <View className={containerBaseClass}>
      <TouchableOpacity 
        className={`flex-row items-center gap-1 px-3 py-2 rounded-full border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`} 
        onPress={onDropdownPress}
      >
        <Ionicons name="chevron-down" size={24} color={iconColor} />
        <Text className={`text-sm font-medium ${
          isDarkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>{dropdownText}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className={`p-2 rounded-lg border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`} 
        onPress={onSortPress}
      >
        <Ionicons name="swap-vertical" size={24} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

  // Variant 6: Dropdown + Sort with Badge
  if (variant === 'dropdown-with-sort-badge') {
  return (
    <View className={containerBaseClass}>
      <TouchableOpacity 
        className={`flex-row items-center gap-1 px-3 py-2 rounded-full border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`} 
        onPress={onDropdownPress}
      >
        <Ionicons name="chevron-down" size={24} color={iconColor} />
        <Text className={`text-sm font-medium ${
          isDarkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>{dropdownText}</Text>
      </TouchableOpacity>

      <View>
        <TouchableOpacity 
          className={`p-2 rounded-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`} 
          onPress={onSortPress}
        >
          <Ionicons name="swap-vertical" size={24} color={iconColor} />
        </TouchableOpacity>
        {badgeCount > 0 && (
          <View className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-violet-500 rounded-full items-center justify-center px-1">
            <Text className="text-xs font-semibold text-white">{badgeCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

  return null;
}
