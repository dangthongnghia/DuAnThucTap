import { apiClient, ApiResponse } from './apiClient';

// Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface RegisterResponse {
  user: User;
}

export interface MeResponse {
  user: User;
}

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Đăng nhập
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data, {
      requiresAuth: false,
    });

    if (response.success && response.data) {
      // Store token and user info
      await apiClient.setAuthToken(response.data.accessToken);
      if (response.data.refreshToken) {
        await apiClient.setRefreshToken(response.data.refreshToken);
      }
      await apiClient.setUser(response.data.user);
    }

    return response;
  },

  /**
   * Đăng ký
   */
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data, {
      requiresAuth: false,
    });

    if (response.success && response.data) {
      await apiClient.setUser(response.data.user);
    }

    return response;
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    await apiClient.clearTokens();
    await apiClient.clearUser();
  },

  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser(): Promise<ApiResponse<MeResponse>> {
    return apiClient.get<MeResponse>('/auth/me');
  },

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  async isLoggedIn(): Promise<boolean> {
    return apiClient.isAuthenticated();
  },

  /**
   * Get cached user from storage
   */
  async getCachedUser(): Promise<User | null> {
    return apiClient.getUser();
  },

  /**
   * Refresh token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const refreshToken = await apiClient.getRefreshToken();
    if (!refreshToken) {
      return { success: false, message: 'No refresh token' };
    }

    const response = await apiClient.post<{ token: string }>(
      '/auth/refresh',
      { refreshToken },
      { requiresAuth: false }
    );

    if (response.success && response.data) {
      await apiClient.setAuthToken(response.data.token);
    }

    return response;
  },

  /**
   * Login with existing token (Social Login)
   */
  async loginWithToken(user: User, token: string): Promise<void> {
    await apiClient.setAuthToken(token);
    await apiClient.setUser(user);
  },
};
