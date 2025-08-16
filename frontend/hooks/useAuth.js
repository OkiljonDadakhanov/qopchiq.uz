"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

// Define types
interface User {
  _id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  language: "uz" | "en";
  monthlyLimit: number;
  currentBalance: number;
  level: number;
  coins: number;
  streak: number;
  badges: string[];
  preferences?: {
    notifications: boolean,
    currency: string,
    theme: string,
    dailyReminder: boolean,
    weeklyReport: boolean,
  };
  lastActive: Date;
  isActive: boolean;
  joinedAt: Date;
}

interface AuthContextType {
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

const AuthContext = (createContext < AuthContextType) | (undefined > undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode,
}) {
  const [user, setUser] = (useState < User) | (null > null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [telegramWebApp, setTelegramWebApp] = (useState < any) | (null > null);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false);

  useEffect(() => {
    // Initialize Telegram Web App
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setTelegramWebApp(tg);
      setIsTelegramAvailable(true);

      // Expand the Web App to full height
      try {
        tg.expand();
      } catch (error) {
        console.log("Could not expand Telegram Web App:", error);
      }

      // Set theme (only if supported)
      try {
        if (tg.setHeaderColor && typeof tg.setHeaderColor === "function") {
          tg.setHeaderColor("#3b82f6");
        }
      } catch (error) {
        console.log("Header color not supported in this Telegram version");
      }

      try {
        if (
          tg.setBackgroundColor &&
          typeof tg.setBackgroundColor === "function"
        ) {
          tg.setBackgroundColor("#ffffff");
        }
      } catch (error) {
        console.log("Background color not supported in this Telegram version");
      }

      // Check if user is already authenticated
      if (tg.initDataUnsafe?.user) {
        handleTelegramAuth(tg.initDataUnsafe.user);
      } else {
        setLoading(false);
      }
    } else {
      // Not running in Telegram, check for existing auth
      checkExistingAuth();
    }
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
          throw new Error("Invalid token");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramAuth = async (telegramUser: any) => {
    try {
      setLoading(true);
      const authData = {
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username || undefined,
        firstName: telegramUser.first_name || undefined,
        lastName: telegramUser.last_name || undefined,
        language: telegramUser.language_code === "en" ? "en" : "uz",
      };

      const response = await apiClient.login(authData);

      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);

        // Store user data in localStorage for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "qopchiq_user",
            JSON.stringify(response.data.user)
          );
        }
      }
    } catch (error) {
      console.error("Telegram authentication failed:", error);
      // Fallback to manual login if needed
    } finally {
      setLoading(false);
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
          throw new Error("Invalid token");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
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

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "qopchiq_user",
            JSON.stringify(response.data.user)
          );
        }

        return response;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if user is authenticated
      if (isAuthenticated) {
        await apiClient.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      apiClient.setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("qopchiq_user");
      }
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = async (userData: any) => {
    try {
      if (!user?.telegramId) throw new Error("User not found");

      const updatedUser = await apiClient.updateUser(user.telegramId, userData);
      if (updatedUser.success) {
        setUser(updatedUser.data);

        // Update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "qopchiq_user",
            JSON.stringify(updatedUser.data)
          );
        }

        return updatedUser;
      } else {
        throw new Error(updatedUser.message || "Update failed");
      }
    } catch (error) {
      console.error("User update failed:", error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.refreshToken();
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token);
        return response.data.token;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    }
    return null;
  };

  const contextValue: AuthContextType = {
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

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
