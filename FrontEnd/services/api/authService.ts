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
  token: string;
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
      await apiClient.setAuthToken(response.data.token);
      await apiClient.setRefreshToken(response.data.refreshToken);
    }

    return response;
  },

  /**
   * Đăng ký
   */
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return apiClient.post<RegisterResponse>('/auth/register', data, {
      requiresAuth: false,
    });
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    await apiClient.clearTokens();
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
};
