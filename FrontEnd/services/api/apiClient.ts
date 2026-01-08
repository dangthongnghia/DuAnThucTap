import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL cho API - Thay đổi theo môi trường
// Sử dụng environment variable hoặc fallback về production
const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  'https://be-easy-fin.vercel.app/api';

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
 * Request options
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  timeout?: number;
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

/**
 * API Client class for handling all HTTP requests
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get stored auth token
   */
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Store auth token
   */
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Store refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  /**
   * Get stored refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Clear auth tokens
   */
  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return token !== null && token.length > 0;
  }

  /**
   * Get stored user data
   */
  async getUser(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Store user data
   */
  async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear user data
   */
  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  }

  /**
   * Make HTTP request with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Main request method
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = true,
      timeout = REQUEST_TIMEOUT,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth token if required
    if (requiresAuth) {
      const token = await this.getAuthToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await this.fetchWithTimeout(url, requestOptions, timeout);

      // Try to parse response
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses (204 No Content, etc)
        data = response.ok ? {} : { success: false, message: 'Invalid response format' };
      }

      // Handle HTTP errors
      if (!response.ok) {
        const errorMessage = 
          data?.message || 
          data?.error?.message || 
          `HTTP ${response.status}: ${response.statusText}`;

        // Handle 401/403 - Unauthorized
        if ((response.status === 401 || response.status === 403) && requiresAuth) {
          await this.clearTokens();
          await this.clearUser();
          
          if (authFailureCallback) {
            authFailureCallback();
          }

          const error: ApiError = {
            success: false,
            message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
            code: response.status.toString(),
          };

          if (globalErrorCallback) {
            globalErrorCallback(error);
          }

          return {
            success: false,
            message: error.message,
          };
        }

        const error: ApiError = {
          success: false,
          message: errorMessage,
          code: response.status.toString(),
          payload: data,
        };

        if (globalErrorCallback) {
          globalErrorCallback(error);
        }

        return {
          success: false,
          message: errorMessage,
          data: data,
        };
      }

      // Handle successful response
      // Backend có thể trả về response với cấu trúc { success, data, message }
      // hoặc chỉ trả về data trực tiếp
      if (data.success === false) {
        return {
          success: false,
          message: data.message || 'Unknown error',
          data: data,
        };
      }

      // If response has 'data' field, wrap it properly
      if (data.data !== undefined && !data.success) {
        return data;
      }

      // If response structure is { success, data, ... }
      if ('success' in data) {
        return data as ApiResponse<T>;
      }

      // Otherwise wrap the response in standard format
      return {
        success: true,
        data: data as T,
      };

    } catch (error) {
      let errorMessage = 'Network error';
      let errorCode = 'NETWORK_ERROR';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout - vui lòng thử lại';
          errorCode = 'TIMEOUT';
        } else {
          errorMessage = error.message;
          errorCode = error.name || 'UNKNOWN_ERROR';
        }
      }

      const apiError: ApiError = {
        success: false,
        message: errorMessage,
        code: errorCode,
      };

      if (globalErrorCallback) {
        globalErrorCallback(apiError);
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export class for testing
export { ApiClient };
