import { useState, useCallback, useEffect } from 'react';
import { authService, User, LoginRequest, RegisterRequest } from '../services/api';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook để quản lý authentication
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async (data: LoginRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(data);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return true;
      }
      setError(response.message || 'Đăng nhập thất bại');
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi đăng nhập';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(data);
      if (response.success) {
        // After registration, user might need to login separately
        return true;
      }
      setError(response.message || 'Đăng ký thất bại');
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi đăng ký';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setLoading(true);

    try {
      const isLoggedIn = await authService.isLoggedIn();
      if (isLoggedIn) {
        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Token might be invalid
          await authService.logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize auth from cached user (useful on app startup)
   */
  const initializeAuth = useCallback(async () => {
    setLoading(true);

    try {
      // First check if token exists
      const isLoggedIn = await authService.isLoggedIn();
      
      if (isLoggedIn) {
        // Try to get cached user first
        const cachedUser = await authService.getCachedUser();
        if (cachedUser) {
          setUser(cachedUser);
          setIsAuthenticated(true);
        }

        // Then verify with server
        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear it
          await authService.logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    initializeAuth,
    clearError,
  };
}
