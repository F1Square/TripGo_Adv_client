import { useState, useEffect } from 'react';
import { authService, type User } from '../services/authService';
import { preloadCriticalComponents } from '../utils/componentPreloader';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored auth token and user data using authService
    const token = authService.getStoredToken();
    const user = authService.getStoredUser();
    
    if (token && user) {
      setAuth({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      // Preload critical components for authenticated users
      preloadCriticalComponents();
    } else {
      setAuth({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login(email, password);
      
      if (result.success && result.data) {
        setAuth({
          user: result.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await authService.register(name, email, password);
      
      if (result.success && result.data) {
        setAuth({
          user: result.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const googleLogin = async (credential: string) => {
    try {
      const result = await authService.googleAuth(credential);
      
      if (result.success && result.data) {
        setAuth({
          user: result.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        // Preload critical components for authenticated users
        preloadCriticalComponents();
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Google authentication failed' };
    } catch (error) {
      console.error('Google authentication error:', error);
      return { success: false, error: 'Google authentication failed' };
    }
  };

  const logout = () => {
    authService.logout();
    setAuth({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    ...auth,
    login,
    register,
    googleLogin,
    logout,
  };
};