import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ViewStyle, TextStyle } from 'react-native';

// Định nghĩa kiểu cho props để tận dụng TypeScript Autocomplete
export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle | TextStyle;
  className?: string; // Hỗ trợ NativeWind nếu cần
}

/**
 * Component Icon dùng chung cho toàn dự án
 * Sử dụng thư viện MaterialCommunityIcons từ @expo/vector-icons
 * 
 * @example
 * <Icon name="home" size={30} color="blue" />
 */
export const Icon = ({ name, size = 24, color = '#374151', style, className }: IconProps) => {
  return (
    <MaterialCommunityIcons 
      name={name} 
      size={size} 
      color={color} 
      style={style}
      // @ts-ignore: NativeWind hỗ trợ className cho component này qua babel plugin
      className={className} 
    />
  );
};

export default Icon;
