'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from 'react';
import { apiClient } from '@/lib/api';

export interface User {
  _id: string;
  telegramId: string;
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
  telegramWebApp: any | null;
  isTelegramAvailable: boolean;
  login: (telegramData: any) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => Promise<any>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  handleTelegramAuth: (telegramUser: any) => Promise<void>;
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
  const [telegramWebApp, setTelegramWebApp] = useState<any | null>(null);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const tg = (window as any)?.Telegram?.WebApp;
        const hasTG = Boolean(tg);
        const hasTGUser = Boolean(tg?.initDataUnsafe?.user);

        if (hasTG) {
          setTelegramWebApp(tg);
          setIsTelegramAvailable(true);

          // Guard Telegram-only APIs to avoid warnings
          try { tg.expand?.(); } catch { }
          const v = parseFloat(tg?.version || '0');
          try { if (v >= 6.1 && typeof tg.setHeaderColor === 'function') tg.setHeaderColor('bg_color'); } catch { }
          try { if (v >= 6.1 && typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor('#ffffff'); } catch { }
          tg?.ready?.();
        }

        if (hasTGUser) {
          await handleTelegramAuth(tg.initDataUnsafe.user);
        } else {
          await checkExistingAuth();
        }
      } catch (e) {
        console.error('Auth boot error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    boot();

    // Failsafe so UI never stays stuck
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  const checkExistingAuth = async () => {
    try {
      const token = apiClient.getToken();
      if (token) {
        const userData = await apiClient.getProfile();
        if (userData.success) {
          setUser(userData.data);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
    }
  };

  const handleTelegramAuth = async (telegramUser: any) => {
    try {
      const authData = {
        telegramId: String(telegramUser.id),
        username: telegramUser.username || undefined,
        firstName: telegramUser.first_name || undefined,
        lastName: telegramUser.last_name || undefined,
        language: telegramUser.language_code === 'en' ? 'en' : 'uz',
      };

      const response = await apiClient.login(authData);
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('qopchiq_user', JSON.stringify(response.data.user));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Telegram authentication failed:', error);
    }
  };

  const checkAuth = async () => {
    try {
      const token = apiClient.getToken();
      if (token) {
        const userData = await apiClient.getProfile();
        if (userData.success) {
          setUser(userData.data);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (telegramData: any) => {
    try {
      setLoading(true);
      const response = await apiClient.login(telegramData);
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('qopchiq_user', JSON.stringify(response.data.user));
        return response;
      }
      throw new Error(response.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { if (isAuthenticated) await apiClient.logout(); } catch { }
    apiClient.setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('qopchiq_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (userData: any) => {
    if (!user?.telegramId) throw new Error('User not found');
    const updatedUser = await apiClient.updateUser(user.telegramId, userData);
    if (updatedUser.success) {
      setUser(updatedUser.data);
      localStorage.setItem('qopchiq_user', JSON.stringify(updatedUser.data));
      return updatedUser;
    }
    throw new Error(updatedUser.message || 'Update failed');
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.refreshToken();
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token);
        return response.data.token;
      }
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
    telegramWebApp,
    isTelegramAvailable,
    login,
    logout,
    updateUser,
    checkAuth,
    refreshToken,
    handleTelegramAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
