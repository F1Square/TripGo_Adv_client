import { apiService } from './api';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
}

// Authentication response interface
export interface AuthResponse {
  user: User;
  token: string;
}

// Login request interface
export interface LoginRequest {
  email: string;
  password: string;
}

// Register request interface
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Google authentication request interface
export interface GoogleAuthRequest {
  credential: string;
}

class AuthService {
  // Login user
  async login(email: string, password: string) {
    const result = await apiService.post<AuthResponse>('/auth/login', { email, password });
    
    if (result.success && result.data) {
      // Store token and user data
      localStorage.setItem('trip_tracker_token', result.data.token);
      localStorage.setItem('trip_tracker_user', JSON.stringify(result.data.user));
    }
    
    return result;
  }

  // Register user
  async register(name: string, email: string, password: string) {
    const result = await apiService.post<AuthResponse>('/auth/register', { name, email, password });
    
    if (result.success && result.data) {
      // Store token and user data
      localStorage.setItem('trip_tracker_token', result.data.token);
      localStorage.setItem('trip_tracker_user', JSON.stringify(result.data.user));
    }
    
    return result;
  }

  // Google Sign-In/Sign-Up
  async googleAuth(credential: string) {
    const result = await apiService.post<AuthResponse>('/auth/google', { credential });
    
    if (result.success && result.data) {
      // Store token and user data
      localStorage.setItem('trip_tracker_token', result.data.token);
      localStorage.setItem('trip_tracker_user', JSON.stringify(result.data.user));
    }
    
    return result;
  }

  // Get current user profile
  async getCurrentUser() {
    return await apiService.get<User>('/auth/me');
  }

  // Logout user (clear local storage)
  logout() {
    localStorage.removeItem('trip_tracker_token');
    localStorage.removeItem('trip_tracker_user');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('trip_tracker_token');
    return !!token;
  }

  // Get stored user data
  getStoredUser(): User | null {
    const userData = localStorage.getItem('trip_tracker_user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        return null;
      }
    }
    return null;
  }

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('trip_tracker_token');
  }
}

// Create and export a default instance
export const authService = new AuthService();
export default authService;