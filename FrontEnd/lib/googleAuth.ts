import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './api';

WebBrowser.maybeCompleteAuthSession();

const APP_SCHEME = 'quanlytaichinh';

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lắng nghe deep link callback
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = async (event: { url: string }) => {
    const { url } = event;
    
    if (url.startsWith(`${APP_SCHEME}://login`)) {
      const params = new URL(url).searchParams;
      const success = params.get('success');
      const token = params.get('token');
      const userStr = params.get('user');
      const errorMsg = params.get('error');

      if (success === 'true' && token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('userData', JSON.stringify(user));
          // Reload app hoặc navigate
          setIsLoading(false);
        } catch (e) {
          setError('Lỗi xử lý dữ liệu đăng nhập');
          setIsLoading(false);
        }
      } else if (errorMsg) {
        setError(decodeURIComponent(errorMsg));
        setIsLoading(false);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const redirectUri = `${APP_SCHEME}://login`;
      const authUrl = `${API_CONFIG.BASE_URL}/api/auth/google/start?redirect_uri=${encodeURIComponent(redirectUri)}`;

      // Mở browser để đăng nhập
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'cancel' || result.type === 'dismiss') {
        setIsLoading(false);
        return null;
      }

      // Deep link sẽ được xử lý bởi handleDeepLink
      return null;
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
      setIsLoading(false);
      return null;
    }
  };

  return {
    signInWithGoogle,
    isLoading,
    error,
  };
}