"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Droplets, LogOut } from "lucide-react";

// Import components (keep your paths)
import { AddExpenseModal as AddExpenseModalBase } from "@/components/add-expense-modal";
import { AddMealModal as AddMealModalBase } from "@/components/add-meal-modal";
import { ExpenseList } from "@/components/expense-list";
import { DailyTip } from "@/components/daily-tip";
import { SpendingLimit as SpendingLimitBase } from "@/components/spending-limit";
import { Gamification as GamificationBase } from "@/components/gamification";
import { Navigation as NavigationBase } from "@/components/navigation";
import { DailyFinanceDigest as DailyFinanceDigestBase } from "@/components/daily-finance-suggest";
import ProtectedRoute from "@/components/protected-route";

import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

// ---------- Types (restore these) ----------
interface Expense {
  id: string;
  amount: number;
  category: string;
  emoji: string;
  description: string;
  date: string;
  mood?: string;
  location?: string;
}

interface Meal {
  id: string;
  name: string;
  calories: number;
  emoji: string;
  date: string;
  category: "protein" | "carbs" | "veggies" | "sweets";
}

interface UserData {
  monthlyLimit: number;
  currentBalance: number;
  level: number;
  coins: number;
  streak: number;
  badges: string[];
}
// -------------------------------------------

// Temporary: relax prop types to unblock rendering.
// Later, replace these aliases with proper props or fix the child component prop interfaces.
const SpendingLimit = SpendingLimitBase as unknown as React.ComponentType<any>;
const DailyFinanceDigest =
  DailyFinanceDigestBase as unknown as React.ComponentType<any>;
const Gamification = GamificationBase as unknown as React.ComponentType<any>;
const AddExpenseModal =
  AddExpenseModalBase as unknown as React.ComponentType<any>;
const AddMealModal = AddMealModalBase as unknown as React.ComponentType<any>;
const Navigation = NavigationBase as unknown as React.ComponentType<any>;

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [language, setLanguage] = useState<"uz" | "en">("uz");
  const [userData, setUserData] = useState<UserData>({
    monthlyLimit: 1000000,
    currentBalance: 0,
    level: 1,
    coins: 0,
    streak: 0,
    badges: [],
  });

  // Use auth's loading; keep local loading only for page data
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await loadUserData(user.telegramId);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, user]);

  const loadUserData = async (telegramId: string) => {
    try {
      const [userStats, userExpenses, userMeals] = await Promise.all([
        apiClient.getUserStats(telegramId),
        apiClient.getExpenses({ userId: telegramId, limit: 50 }),
        apiClient.getMeals({ userId: telegramId, limit: 50 }),
      ]);

      if (userStats.success) {
        const data = userStats.data || {};
        setUserData({
          monthlyLimit: data.monthlyLimit ?? 1000000,
          currentBalance: data.currentBalance ?? 0,
          level: data.level ?? 1,
          coins: data.coins ?? 0,
          streak: data.streak ?? 0,
          badges: data.badges ?? [],
        });
      }
      if (userExpenses.success) setExpenses(userExpenses.data?.expenses ?? []);
      if (userMeals.success) setMeals(userMeals.data?.meals ?? []);
      if (user?.language) setLanguage(user.language);
    } catch (e) {
      console.error("Failed to load user data:", e);
    }
  };

  const handleAddExpense = async (expenseData: any) => {
    if (!user?.telegramId) return;
    try {
      const res = await apiClient.createExpense({
        ...expenseData,
        userId: user.telegramId,
      });
      if (res.success) {
        setExpenses((prev) => [res.data, ...prev]);
        setShowExpenseModal(false);
        loadUserData(user.telegramId); // refresh, non-blocking
      }
    } catch (e) {
      console.error("Failed to add expense:", e);
    }
  };

  const handleAddMeal = async (mealData: any) => {
    if (!user?.telegramId) return;
    try {
      const res = await apiClient.createMeal({
        ...mealData,
        userId: user.telegramId,
      });
      if (res.success) {
        setMeals((prev) => [res.data, ...prev]);
        setShowMealModal(false);
        loadUserData(user.telegramId);
      }
    } catch (e) {
      console.error("Failed to add meal:", e);
    }
  };

  const handleWaterIntake = async (amount: number) => {
    if (!user?.telegramId) return;
    try {
      await apiClient.trackWater({ userId: user.telegramId, amount });
      setWaterIntake((prev) => prev + amount);
    } catch (e) {
      console.error("Failed to track water intake:", e);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const busy = authLoading || loading;

  if (busy) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user?.firstName?.[0] || user?.username?.[0] || "U"}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {user?.firstName || user?.username || "User"}
                </h1>
                <p className="text-sm text-gray-500">
                  Level {userData.level} • {userData.coins} coins
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex space-x-4">
                <Button
                  onClick={() => setShowExpenseModal(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
                <Button
                  onClick={() => setShowMealModal(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meal
                </Button>
              </div>

              {/* Spending limit */}
              <SpendingLimit
                monthlyLimit={userData.monthlyLimit}
                currentBalance={userData.currentBalance}
                language={language}
              />

              {/* Recent expenses */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {language === "uz"
                      ? "So'nggi xarajatlar"
                      : "Recent Expenses"}
                  </h2>
                  <ExpenseList
                    expenses={expenses.slice(0, 5)}
                    language={language}
                  />
                </CardContent>
              </Card>

              {/* Digest */}
              <DailyFinanceDigest
                expenses={expenses}
                meals={meals}
                language={language}
              />
            </div>

            {/* Right */}
            <div className="space-y-6">
              <Gamification
                level={userData.level}
                coins={userData.coins}
                streak={userData.streak}
                badges={userData.badges}
                language={language}
              />

              {/* Water */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                      {language === "uz" ? "Suv ichish" : "Water Intake"}
                    </h3>
                    <Badge variant="secondary">{waterIntake}ml</Badge>
                  </div>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWaterIntake(250)}
                      className="w-full"
                    >
                      +250ml
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWaterIntake(500)}
                      className="w-full"
                    >
                      +500ml
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <DailyTip language={language} />
            </div>
          </div>
        </div>

        {/* Modals */}
        <AddExpenseModal
          open={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          onSubmit={handleAddExpense}
          language={language}
        />
        <AddMealModal
          open={showMealModal}
          onClose={() => setShowMealModal(false)}
          onSubmit={handleAddMeal}
          language={language}
        />

        <Navigation activePage="home" language={language} />
      </div>
    </ProtectedRoute>
  );
}
