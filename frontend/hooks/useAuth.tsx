'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from 'react';
import { apiClient } from '@/lib/api'; // or '../lib/api' if you don't use @ alias

export interface User {
  _id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  language: 'uz' | 'en';
  monthlyLimit: number;
  currentBalance: number;
  level: number;
  coins: number;
  streak: number;
  badges: string[];
  preferences?: {
    notifications: boolean;
    currency: string;
    theme: string;
    dailyReminder: boolean;
    weeklyReport: boolean;
  };
  lastActive: Date;
  isActive: boolean;
  joinedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (
    email: string,
    password: string,
    username?: string,
    firstName?: string,
    lastName?: string
  ) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => Promise<any>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const token = apiClient.getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        await checkExistingAuth();
      } catch (e) {
        console.error('Auth boot error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    boot();

    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 2000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  const checkExistingAuth = async () => {
    try {
      const token = apiClient.getToken();
      if (!token) return;

      const userData = await apiClient.getProfile();
      if (userData.success) {
        setUser(userData.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      apiClient.setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('qopchiq_user');
      }
    }
  };

  const checkAuth = async () => {
    try {
      const token = apiClient.getToken();
      if (!token) return;

      const userData = await apiClient.getProfile();
      if (userData.success) {
        setUser(userData.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Demo login (optional)
      if (email === 'demo@qopchiq.uz' && password === 'demo123') {
        const demoUser: User = {
          _id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId format
          email: 'demo@qopchiq.uz',
          username: 'demo_user',
          firstName: 'Demo',
          lastName: 'User',
          language: 'uz',
          monthlyLimit: 1_000_000,
          currentBalance: 500_000,
          level: 5,
          coins: 150,
          streak: 7,
          badges: ['first_expense', 'savings_master'],
          lastActive: new Date(),
          isActive: true,
          joinedAt: new Date(),
        };

        setUser(demoUser);
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('qopchiq_user', JSON.stringify(demoUser));
          localStorage.setItem('auth_token', 'demo-token');
        }

        return { success: true, data: { user: demoUser, token: 'demo-token' } };
      }

      const response = await apiClient.login({ email, password });
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('qopchiq_user', JSON.stringify(response.data.user));
        }
        return response;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    username?: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      setLoading(true);
      const response = await apiClient.register({
        email,
        password,
        username,
        firstName,
        lastName,
        language: 'uz',
      });
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('qopchiq_user', JSON.stringify(response.data.user));
        }
        return response;
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isAuthenticated) await apiClient.logout();
    } catch {
      // ignore
    }
    apiClient.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('qopchiq_user');
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (userData: any) => {
    if (!user?._id) throw new Error('User not found');
    const updatedUser = await apiClient.updateUser(user._id, userData);
    if (updatedUser.success) {
      setUser(updatedUser.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('qopchiq_user', JSON.stringify(updatedUser.data));
      }
      return updatedUser;
    }
    throw new Error(updatedUser.message || 'Update failed');
  };

  const refreshToken = async () => {
    try {
      const newToken = await apiClient.refreshToken();
      if (newToken) return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
    return null;
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider };
