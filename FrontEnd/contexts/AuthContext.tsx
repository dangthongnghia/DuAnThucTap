import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, User as ApiUser, setAuthFailureCallback } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithData: (user: User, token: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
export const useAuth = useAuthContext; // Alias for compatibility

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on app start
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const isLoggedIn = await authService.isLoggedIn();
        if (isLoggedIn) {
          // Try to get fresh user data from API
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data.user as unknown as User);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            await authService.logout();
            setIsAuthenticated(false);
          }
        } else {
          // Check for cached user
          const cachedUser = await authService.getCachedUser();
          if (cachedUser) {
            setUser(cachedUser as unknown as User);
          }
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up global auth failure callback
    setAuthFailureCallback(async () => {
      setUser(null);
      setIsAuthenticated(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user as unknown as User);
        setIsAuthenticated(true);
        return true;
      }

      setError(response.message || 'Đăng nhập thất bại');
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithData = useCallback(async (userData: User, token: string) => {
    setIsLoading(true);
    try {
      await authService.loginWithToken(userData as unknown as ApiUser, token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('SignInWithData error:', err);
      setError('Lỗi đồng bộ dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.register({ name, email, password });

        if (response.success) {
          // After registration, user should login
          return true;
        }

        setError(response.message || 'Đăng ký thất bại');
        return false;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
      // Force logout even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (isLoggedIn) {
        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data.user as unknown as User);
          setIsAuthenticated(true);
        } else {
          await authService.logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Check auth error:', err);
      setIsAuthenticated(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    signIn,
    signInWithData,
    signUp,
    signOut,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}