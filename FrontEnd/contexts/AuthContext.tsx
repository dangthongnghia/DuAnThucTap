import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storageService from '../services/storageService';

interface User {
  id?: string;
  name: string;
  email: string;
  picture: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (user: User, accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('userInfo');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const signIn = async (newUser: User, accessToken: string) => {
    try {
      // Lưu thông tin user và token
      setUser(newUser);
      await AsyncStorage.setItem('userInfo', JSON.stringify(newUser));
      await AsyncStorage.setItem('accessToken', accessToken);
      
      // Đồng bộ dữ liệu local lên server
      await storageService.syncLocalToServer();
      console.log('User signed in and local data synced to server');
    } catch (error) {
      console.error('Error during sign in:', error);
      // Nếu đồng bộ thất bại, vẫn cho phép đăng nhập
      // Có thể hiển thị warning cho user
    }
    
    // Navigation will be handled by the calling component
  };

  const signOut = async () => {
    try {
      // Tùy chọn: Tải dữ liệu từ server về local để sử dụng offline
      // Bỏ comment dòng dưới nếu muốn giữ dữ liệu sau khi logout
      // await storageService.syncServerToLocal();
      
      // Xóa thông tin user và token
      setUser(null);
      await AsyncStorage.removeItem('userInfo');
      await AsyncStorage.removeItem('accessToken');
      
      console.log('User signed out');
    } catch (error) {
      console.error('Error during sign out:', error);
      // Vẫn logout dù có lỗi
      setUser(null);
      await AsyncStorage.removeItem('userInfo');
      await AsyncStorage.removeItem('accessToken');
    }
    
    // Navigation will be handled by the calling component
  };

  const value = { user, signIn, signOut, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}