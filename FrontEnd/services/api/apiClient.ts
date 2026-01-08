import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL cho API
const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL || 'https://be-easy-fin.vercel.app/api').trim();

console.log('Using API_BASE_URL:', API_BASE_URL);

// Token storage keys
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

// Request timeout
const REQUEST_TIMEOUT = 30000;

// Global error callback
let globalErrorCallback: ((error: ApiError) => void) | null = null;
let authFailureCallback: (() => void) | null = null;

/**
 * API Response interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Error response interface
 */
export interface ApiError {
  success: false;
  message: string;
  code?: string;
  payload?: any;
}

/**
 * Request options (Extending Axios config behavior)
 */
interface RequestOptions {
  requiresAuth?: boolean;
}

/**
 * Set global error callback for handling API errors
 */
export function setGlobalErrorCallback(callback: (error: ApiError) => void) {
  globalErrorCallback = callback;
}

/**
 * Set auth failure callback for handling 401/403 errors
 */
export function setAuthFailureCallback(callback: () => void) {
  authFailureCallback = callback;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor(baseUrl: string) {
    this.instance = axios.create({
      baseURL: baseUrl,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor: Attach Token
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig & { requiresAuth?: boolean }) => {
        // Default to requiring auth unless explicitly set to false
        const requiresAuth = config.requiresAuth !== false;

        if (requiresAuth) {
          const token = await this.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle Errors & Data Unwrapping
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const data = response.data;

        // Match the backend's standard { success, data, message } or return raw
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        return {
          success: true,
          data: data,
        };
      },
      async (error: AxiosError) => {
        const response = error.response;
        let errorMessage = 'Network error';
        let errorCode = error.code || 'UNKNOWN_ERROR';
        let payload = null;

        if (response) {
          errorCode = response.status.toString();
          payload = response.data;

          const data = response.data as any;
          errorMessage = data?.message || data?.error?.message || `HTTP ${response.status}: ${response.statusText}`;

          // Handle 401/403 - Unauthorized
          if (response.status === 401 || response.status === 403) {
            await this.clearTokens();
            await this.clearUser();

            if (authFailureCallback) {
              authFailureCallback();
            }

            errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
          }
        } else if (error.request) {
          errorMessage = 'Không có phản hồi từ server. Vui lòng kiểm tra kết nối.';
          errorCode = 'NO_RESPONSE';
        } else {
          errorMessage = error.message;
        }

        const apiError: ApiError = {
          success: false,
          message: errorMessage,
          code: errorCode,
          payload: payload,
        };

        if (globalErrorCallback) {
          globalErrorCallback(apiError);
        }

        return {
          success: false,
          message: errorMessage,
          data: payload,
        };
      }
    );
  }

  // --- Token Management ---

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }

  // --- User Management ---

  async getUser(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  }

  // --- Generic Request Methods ---

  async get<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.instance.get(url, options as any);
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, options as any);
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, options as any);
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, options as any);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.instance.delete(url, options as any);
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export class for testing
export { ApiClient };
