"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Plus,
  TrendingDown,
  Target,
  TrendingUp,
} from "lucide-react";

import { ExpenseList } from "@/components/expense-list";
import { AddExpenseModal } from "@/components/add-expense-modal";
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

interface Analytics {
  totalExpenses: number;
  totalIncome: number;
  savings: number;
  monthlySpending: number;
  spendingByCategory: Record<string, number>;
}

export default function ExpensesPage() {
  const { user, isAuthenticated, loading } = useAuth();

  // State for data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Fetch expenses data
  const fetchExpensesData = async () => {
    if (!user?._id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      setError(null);

      // Fetch expenses
      try {
        const expensesResponse = await apiClient.getRecentExpenses(user._id, 50);
        if (expensesResponse.success && expensesResponse.data?.expenses) {
          setExpenses(expensesResponse.data.expenses);
        }
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      }

      // Fetch analytics
      try {
        const analyticsResponse = await apiClient.getOverviewAnalytics(user._id, "month");
        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }

    } catch (error) {
      console.error("Error in fetchExpensesData:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchExpensesData();
    } else if (isAuthenticated && !loading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, loading]);

  // Handle expense creation
  const handleExpenseAdded = async (newExpense: any) => {
    if (!user?._id) return;

    try {
      const response = await apiClient.createExpense({
        ...newExpense,
        userId: user._id,
        date: new Date().toISOString()
      });

      if (response.success) {
        await fetchExpensesData();
      } else {
        console.error("Failed to create expense:", response.message);
        setError("Failed to create expense. Please try again.");
      }
    } catch (error) {
      console.error("Error creating expense:", error);
      setError("Failed to create expense. Please try again.");
    }
  };

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading expenses...</p>
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
            <p>You need to be logged in to access expenses.</p>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
                <p className="text-sm text-gray-500">Track and manage your expenses</p>
              </div>
              <Button
                onClick={() => setShowExpenseModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Expense
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Total Spent This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {analytics?.monthlySpending?.toLocaleString() || "0"} UZS
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Remaining Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {((user.monthlyLimit || 0) - (analytics?.monthlySpending || 0)).toLocaleString()} UZS
                </p>
                <Progress
                  value={((analytics?.monthlySpending || 0) / (user.monthlyLimit || 1)) * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {analytics?.savings?.toLocaleString() || "0"} UZS
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Expenses List */}
          <ExpenseList expenses={expenses} language={language} />
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
    </div>
  );
}
