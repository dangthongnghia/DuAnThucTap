// API Configuration for EasyFin

// Backend URL - change this based on your environment
// For Android emulator: use 10.0.2.2 instead of localhost
// For iOS simulator: use localhost
// For physical device: use your computer's IP address

import { Platform } from 'react-native';

// Your computer's network IP
const NETWORK_IP = '172.28.192.1';
const PORT = '3001';

// Auto-detect the correct URL based on platform
const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Check if running on emulator or real device
      // Emulator uses 10.0.2.2, real device uses network IP
      return `http://10.0.2.2:${PORT}`;
    } else if (Platform.OS === 'ios') {
      return `http://localhost:${PORT}`;
    }
    // Web or other platforms
    return `http://localhost:${PORT}`;
  }
  return 'https://api.easyfin.com';
};

// Alternative URLs for different scenarios
export const API_URLS = {
  // Android emulator
  android: `http://10.0.2.2:${PORT}`,
  // iOS simulator  
  ios: `http://localhost:${PORT}`,
  // Physical device (your computer's IP)
  device: `http://${NETWORK_IP}:${PORT}`,
  // Production
  production: 'https://api.easyfin.com',
};

// Current API URL - Change this if auto-detect doesn't work
// For physical device, use: API_URLS.device
export const API_URL = getApiUrl();

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  PROFILE: '/api/auth/profile',
  GOOGLE_AUTH: '/api/auth/google',
  
  // Transactions
  TRANSACTIONS: '/api/transactions',
  
  // Accounts
  ACCOUNTS: '/api/accounts',
  
  // Categories
  CATEGORIES: '/api/categories',
  
  // Budgets
  BUDGETS: '/api/budgets',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
};

// API Helper function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('accessToken');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, error: 'Network error' };
  }
}

export default {
  API_URL,
  API_ENDPOINTS,
  apiRequest,
};
