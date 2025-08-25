"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
} from "lucide-react";

import { Navigation } from "@/components/navigation";

// Types
interface Analytics {
  totalExpenses: number;
  totalIncome: number;
  savings: number;
  monthlySpending: number;
  spendingByCategory: Record<string, number>;
}

export default function AnalyticsPage() {
  const { user, isAuthenticated, loading } = useAuth();

  // State for data
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    if (!user?._id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      setError(null);

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
      console.error("Error in fetchAnalyticsData:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAnalyticsData();
    } else if (isAuthenticated && !loading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, loading]);

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics...</p>
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
            <p>You need to be logged in to access analytics.</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
                <p className="text-sm text-gray-500">Detailed financial analysis and trends</p>
              </div>
              <Button
                onClick={fetchAnalyticsData}
                disabled={isRefreshing}
                variant="outline"
              >
                <Loader2 className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {analytics?.totalIncome?.toLocaleString() || "0"} UZS
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {analytics?.totalExpenses?.toLocaleString() || "0"} UZS
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Net Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {analytics?.savings?.toLocaleString() || "0"} UZS
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Monthly Spending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">
                  {analytics?.monthlySpending?.toLocaleString() || "0"} UZS
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Spending by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.spendingByCategory && Object.keys(analytics.spendingByCategory).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(analytics.spendingByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([category, amount]) => {
                        const percentage = analytics.monthlySpending > 0
                          ? (amount / analytics.monthlySpending) * 100
                          : 0;
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {category === "food" && "🍕"}
                                  {category === "transport" && "🚗"}
                                  {category === "home" && "🏠"}
                                  {category === "clothes" && "👕"}
                                  {category === "entertainment" && "🎮"}
                                  {category === "health" && "💊"}
                                  {category === "education" && "📚"}
                                  {category === "other" && "💰"}
                                </span>
                                <span className="font-medium capitalize">
                                  {category}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">
                                  {amount.toLocaleString()} UZS
                                </div>
                                <div className="text-sm text-gray-500">
                                  {percentage.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-lg font-medium text-gray-900 mb-2">No spending data available</p>
                    <p className="text-gray-600">Start adding expenses to see your spending analytics</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Total Income:</span>
                  <span className="font-bold text-green-600">
                    {analytics?.totalIncome?.toLocaleString() || "0"} UZS
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium">Total Expenses:</span>
                  <span className="font-bold text-red-600">
                    {analytics?.totalExpenses?.toLocaleString() || "0"} UZS
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-t-2 border-blue-200">
                  <span className="font-bold">Net Savings:</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {analytics?.savings?.toLocaleString() || "0"} UZS
                  </span>
                </div>

                {/* Savings Rate */}
                {analytics?.totalIncome && analytics.totalIncome > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {((analytics.savings / analytics.totalIncome) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Savings Rate</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Insights */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.monthlySpending && user.monthlyLimit ? (
                  <div className="space-y-4">
                    {analytics.monthlySpending > user.monthlyLimit * 0.9 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-red-500">⚠️</span>
                          <span className="font-medium text-red-700">
                            You're approaching your monthly spending limit!
                          </span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">
                          Consider reducing expenses in the next few days.
                        </p>
                      </div>
                    )}

                    {analytics.savings > 0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">🎉</span>
                          <span className="font-medium text-green-700">
                            Great job! You're saving money.
                          </span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          Keep up the good work with your spending habits.
                        </p>
                      </div>
                    )}

                    {analytics.monthlySpending < user.monthlyLimit * 0.5 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">💡</span>
                          <span className="font-medium text-blue-700">
                            You're well under your budget!
                          </span>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">
                          Consider setting aside some money for savings or investments.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">📈</div>
                    <p className="text-lg font-medium text-gray-900 mb-2">No insights available yet</p>
                    <p className="text-gray-600">Add more expenses and income to get personalized insights</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
