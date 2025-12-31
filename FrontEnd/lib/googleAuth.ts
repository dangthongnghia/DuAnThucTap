import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './api';

WebBrowser.maybeCompleteAuthSession();

const APP_SCHEME = 'easyfin-login';

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

      // Clean base URL to ensure no duplicate /api
      let baseUrl = API_CONFIG.BASE_URL;
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
      if (baseUrl.endsWith('/api')) baseUrl = baseUrl.slice(0, -4);

      const authUrl = `${baseUrl}/api/auth/google/start?redirect_uri=${encodeURIComponent(redirectUri)}`;

      // Mở browser để đăng nhập
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        // Xử lý trực tiếp kết quả trả về từ Browser (không cần chờ listener)
        const { url } = result;
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
            setIsLoading(false);
            return { token, user }; // Trả về kết quả để component xử lý (router.replace)
          } catch (e) {
            console.error('Parse user data error:', e);
            setError('Lỗi xử lý dữ liệu đăng nhập');
          }
        } else if (errorMsg) {
          setError(decodeURIComponent(errorMsg));
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        setIsLoading(false);
        return null;
      }

      setIsLoading(false);
      return null;
    } catch (err: any) {
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