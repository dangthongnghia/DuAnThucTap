import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function SplashUI() {
  const scale = useRef(new Animated.Value(0.8)).current; // Bắt đầu với kích thước 80%
  const opacity = useRef(new Animated.Value(0)).current; // Bắt đầu với opacity 0

  useEffect(() => {
    // Phóng to ảnh một chút
    Animated.timing(scale, {
      toValue: 1, // Phóng to lên 100%
      duration: 1200, // Kéo dài 1.2 giây
      useNativeDriver: true,
    }).start();

    // Làm mờ dần trong khi phóng to
    Animated.timing(opacity, {
      toValue: 1, // Mờ dần đến 100%
      duration: 1200, // Cùng thời gian với animation phóng to
      useNativeDriver: true,
    }).start();
  }, [scale, opacity]);

  return (
    <View className="flex-1 bg-background justify-center items-center">
      <Animated.Image
        source={require('../assets/splash_quan_ly_chi_tieu.png')}
        className="w-70 h-70" // Đặt kích thước cố định nhỏ hơn
        style={{
          resizeMode: 'contain', // Đảm bảo toàn bộ ảnh hiển thị trong kích thước mới
          opacity: opacity,
          transform: [{ scale: scale }], // Áp dụng animation phóng to
        }}
        accessible
        accessibilityLabel="Nền màn hình khởi động"
      />
    </View>
  );
}