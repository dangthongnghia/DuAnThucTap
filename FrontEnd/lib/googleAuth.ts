import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_ENDPOINTS } from './api';
import Constants from 'expo-constants';

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs
// Bạn cần tạo OAuth credentials từ Google Cloud Console
// https://console.cloud.google.com/apis/credentials
// Xem hướng dẫn chi tiết: docs/GOOGLE_AUTH_SETUP.md

// Có thể cấu hình qua .env hoặc thay trực tiếp ở đây
const GOOGLE_CLIENT_ID = {
  // Android client ID - từ Google Console, loại "Android"
  // Package name: com.yourcompany.nasteam
  // SHA-1: 62:93:ED:27:EA:5C:5E:17:6F:FF:06:3D:EF:1D:26:8A:27:F6:FC:81
  android: Constants.expoConfig?.extra?.googleAndroidClientId 
    || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
    || 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  
  // iOS client ID - từ Google Console, loại "iOS"
  // Bundle ID: com.yourcompany.begin2
  ios: Constants.expoConfig?.extra?.googleIosClientId
    || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
    || 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  
  // Web client ID - từ Google Console, loại "Web application"
  // Dùng cho Expo Go development
  web: Constants.expoConfig?.extra?.googleWebClientId
    || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    || 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    role: string;
  };
  token?: string;
  error?: string;
}

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID.android,
    iosClientId: GOOGLE_CLIENT_ID.ios,
    webClientId: GOOGLE_CLIENT_ID.web,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response.authentication?.accessToken);
    } else if (response?.type === 'error') {
      setError('Đăng nhập Google thất bại');
    }
  }, [response]);

  const handleGoogleResponse = async (accessToken: string | undefined) => {
    if (!accessToken) {
      setError('Không nhận được access token');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Gọi backend API để xác thực và lấy JWT token
      // Sử dụng API_URL đã tự động detect cho Android/iOS
      const res = await fetch(`${API_URL}${API_ENDPOINTS.GOOGLE_AUTH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data: AuthResult = await res.json();

      if (data.success && data.token && data.user) {
        // Lưu token và user info
        await AsyncStorage.setItem('accessToken', data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          picture: data.user.avatar || '',
          role: data.user.role,
        }));

        return data;
      } else {
        setError(data.error || 'Đăng nhập thất bại');
        return null;
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Lỗi kết nối server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<AuthResult | null> => {
    setError(null);
    const result = await promptAsync();
    
    if (result.type === 'success' && result.authentication?.accessToken) {
      return handleGoogleResponse(result.authentication.accessToken);
    }
    
    return null;
  };

  return {
    signInWithGoogle,
    loading,
    error,
    request,
    isReady: !!request,
  };
}

export default useGoogleAuth;
