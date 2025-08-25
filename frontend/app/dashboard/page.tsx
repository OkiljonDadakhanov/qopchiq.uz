"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Loader2,
    Plus,
    TrendingUp,
    TrendingDown,
    Target,
    Award,
    Calendar,
    Bell,
    User,
    Settings,
    LogOut,
    RefreshCw
} from "lucide-react";

// Import existing components
import { ExpenseList } from "@/components/expense-list";
import { Gamification } from "@/components/gamification";
import { HealthStats } from "@/components/health-stats";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { AddMealModal } from "@/components/add-meal-modal";
import { BillReminders } from "@/components/bill-reminders";
import { DailyTip } from "@/components/daily-tip";
import { Navigation } from "@/components/navigation";

// Types
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

interface Analytics {
    totalExpenses: number;
    totalIncome: number;
    savings: number;
    monthlySpending: number;
    spendingByCategory: Record<string, number>;
}

export default function DashboardPage() {
    const { user, isAuthenticated, loading, logout } = useAuth();

    // State for data
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showMealModal, setShowMealModal] = useState(false);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        if (!user?._id) {
            setIsLoading(false);
            return;
        }

        try {
            setIsRefreshing(true);
            setError(null);

            console.log("Fetching dashboard data for user:", user._id);

            // Set default empty data first
            setExpenses([]);
            setMeals([]);
            setAnalytics(null);

            // Try to fetch expenses (don't block on failure)
            try {
                const expensesResponse = await apiClient.getRecentExpenses(user._id, 10);
                console.log("Expenses response:", expensesResponse);
                if (expensesResponse.success && expensesResponse.data?.expenses) {
                    setExpenses(expensesResponse.data.expenses);
                }
            } catch (error) {
                console.error("Failed to fetch expenses:", error);
            }

            // Try to fetch meals (don't block on failure)
            try {
                const mealsResponse = await apiClient.getRecentMeals(user._id, 10);
                console.log("Meals response:", mealsResponse);
                if (mealsResponse.success && mealsResponse.data?.meals) {
                    setMeals(mealsResponse.data.meals);
                }
            } catch (error) {
                console.error("Failed to fetch meals:", error);
            }

            // Try to fetch analytics (don't block on failure)
            try {
                const analyticsResponse = await apiClient.getOverviewAnalytics(user._id, "month");
                console.log("Analytics response:", analyticsResponse);
                if (analyticsResponse.success && analyticsResponse.data) {
                    setAnalytics(analyticsResponse.data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            }

        } catch (error) {
            console.error("Error in fetchDashboardData:", error);
            // Don't set error state, just continue with empty data
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Load data on mount and when user changes
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchDashboardData();
        } else if (isAuthenticated && !loading) {
            // If authenticated but no user data, still stop loading
            setIsLoading(false);
        }
    }, [isAuthenticated, user, loading]);

    // Timeout to prevent infinite loading
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) {
                console.log("Loading timeout reached, stopping loading state");
                setIsLoading(false);
            }
        }, 10000); // 10 second timeout

        return () => clearTimeout(timeout);
    }, [isLoading]);

    // Handle expense creation
    const handleExpenseAdded = async (newExpense: any) => {
        if (!user?._id) return;

        try {
            // Create expense via API
            const response = await apiClient.createExpense({
                ...newExpense,
                userId: user._id,
                date: new Date().toISOString()
            });

            if (response.success) {
                // Refresh data to get the latest
                await fetchDashboardData();
            } else {
                console.error("Failed to create expense:", response.message);
                setError("Failed to create expense. Please try again.");
            }
        } catch (error) {
            console.error("Error creating expense:", error);
            setError("Failed to create expense. Please try again.");
        }
    };

    // Handle meal creation
    const handleMealAdded = async (newMeal: any) => {
        if (!user?._id) return;

        try {
            // Create meal via API
            const response = await apiClient.createMeal({
                ...newMeal,
                userId: user._id,
                date: new Date().toISOString()
            });

            if (response.success) {
                // Refresh data to get the latest
                await fetchDashboardData();
            } else {
                console.error("Failed to create meal:", response.message);
                setError("Failed to create meal. Please try again.");
            }
        } catch (error) {
            console.error("Error creating meal:", error);
            setError("Failed to create meal. Please try again.");
        }
    };

    // Loading state
    if (loading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Not Authenticated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You need to be logged in to access the dashboard.</p>
                        <Button
                            onClick={() => window.location.href = "/"}
                            className="w-full mt-4"
                        >
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const language = user.language || "uz";

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
            {/* Sidebar Navigation */}
            <Navigation language={language} />

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">
                                        Welcome back, {user.firstName || user.username || "User"}! 👋
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        {user.email} • {new Date().toLocaleDateString(language === "uz" ? "uz-UZ" : "en-US", {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchDashboardData}
                                    disabled={isRefreshing}
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    {isRefreshing ? "Refreshing..." : "Refresh"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={logout}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Content */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-0 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-600 font-medium">Current Balance</p>
                                        <p className="text-2xl font-bold text-green-700">
                                            {user.currentBalance?.toLocaleString() || "0"} UZS
                                        </p>
                                    </div>
                                    <div className="text-3xl">💰</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-0 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium">Monthly Limit</p>
                                        <p className="text-2xl font-bold text-blue-700">
                                            {user.monthlyLimit?.toLocaleString() || "0"} UZS
                                        </p>
                                    </div>
                                    <div className="text-3xl">🎯</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-0 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-purple-600 font-medium">Level</p>
                                        <p className="text-2xl font-bold text-purple-700">
                                            {user.level || 1}
                                        </p>
                                    </div>
                                    <div className="text-3xl">⭐</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-0 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-orange-600 font-medium">Coins</p>
                                        <p className="text-2xl font-bold text-orange-700">
                                            {user.coins || 0}
                                        </p>
                                    </div>
                                    <div className="text-3xl">🪙</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Overview Content */}
                    <div className="space-y-6">
                        {/* Welcome Message for New Users */}
                        {expenses.length === 0 && meals.length === 0 && (
                            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
                                <CardContent className="p-8 text-center">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Welcome to Qopchiq.uz!
                                    </h2>
                                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                        Start tracking your expenses and health to unlock the full power of your personal finance and wellness dashboard.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button
                                            onClick={() => setShowExpenseModal(true)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Your First Expense
                                        </Button>
                                        <Button
                                            onClick={() => setShowMealModal(true)}
                                            variant="outline"
                                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Log Your First Meal
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gamification */}
                            <Gamification
                                userData={{
                                    monthlyLimit: user.monthlyLimit || 1000000,
                                    currentBalance: user.currentBalance || 0,
                                    level: user.level || 1,
                                    coins: user.coins || 0,
                                    streak: user.streak || 0,
                                    badges: user.badges || []
                                }}
                                language={language}
                            />

                            {/* Daily Tip */}
                            <DailyTip language={language} />
                        </div>

                        {/* Recent Expenses */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Recent Expenses</h2>
                                <Button
                                    onClick={() => setShowExpenseModal(true)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Expense
                                </Button>
                            </div>
                            {expenses.length === 0 ? (
                                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                                    <CardContent className="p-8 text-center">
                                        <div className="text-4xl mb-4">💸</div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
                                        <p className="text-gray-600 mb-4">Start tracking your expenses to see them here</p>
                                        <Button
                                            onClick={() => setShowExpenseModal(true)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Your First Expense
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <ExpenseList expenses={expenses} language={language} />
                            )}
                        </div>

                        {/* Bill Reminders */}
                        <BillReminders language={language} />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showExpenseModal && (
                <AddExpenseModal
                    isOpen={showExpenseModal}
                    onClose={() => setShowExpenseModal(false)}
                    onAdd={handleExpenseAdded}
                    language={language}
                    currentBalance={user.currentBalance || 0}
                    monthlySpent={analytics?.monthlySpending || 0}
                    monthlyLimit={user.monthlyLimit || 1000000}
                />
            )}

            {showMealModal && (
                <AddMealModal
                    isOpen={showMealModal}
                    onClose={() => setShowMealModal(false)}
                    onAdd={handleMealAdded}
                    language={language}
                />
            )}
        </div>
    );
}
