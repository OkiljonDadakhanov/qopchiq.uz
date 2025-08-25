"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  HeartPulse,
  Activity,
  Target,
} from "lucide-react";

import { HealthStats } from "@/components/health-stats";
import { AddMealModal } from "@/components/add-meal-modal";
import { Navigation } from "@/components/navigation";

// Types
interface Meal {
  id: string;
  name: string;
  calories: number;
  emoji: string;
  date: string;
  category: "protein" | "carbs" | "veggies" | "sweets";
}

export default function HealthPage() {
  const { user, isAuthenticated, loading } = useAuth();

  // State for data
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showMealModal, setShowMealModal] = useState(false);

  // Fetch health data
  const fetchHealthData = async () => {
    if (!user?._id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      setError(null);

      // Fetch meals
      try {
        const mealsResponse = await apiClient.getRecentMeals(user._id, 50);
        if (mealsResponse.success && mealsResponse.data?.meals) {
          setMeals(mealsResponse.data.meals);
        }
      } catch (error) {
        console.error("Failed to fetch meals:", error);
      }

    } catch (error) {
      console.error("Error in fetchHealthData:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchHealthData();
    } else if (isAuthenticated && !loading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, loading]);

  // Handle meal creation
  const handleMealAdded = async (newMeal: any) => {
    if (!user?._id) return;

    try {
      const response = await apiClient.createMeal({
        ...newMeal,
        userId: user._id,
        date: new Date().toISOString()
      });

      if (response.success) {
        await fetchHealthData();
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
          <p className="text-gray-600">Loading health data...</p>
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
            <p>You need to be logged in to access health data.</p>
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

  // Calculate today's meals
  const today = new Date().toDateString();
  const todaysMeals = meals.filter(meal =>
    new Date(meal.date).toDateString() === today
  );

  // Calculate total calories for today
  const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);

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
                <h1 className="text-2xl font-bold text-gray-900">Health & Nutrition</h1>
                <p className="text-sm text-gray-500">Track your meals and health metrics</p>
              </div>
              <Button
                onClick={() => setShowMealModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Meal
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
                  <HeartPulse className="h-5 w-5 text-red-500" />
                  Today's Calories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {totalCalories} cal
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Target: 2000 cal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Meals Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {todaysMeals.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Meals logged
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Weekly Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(meals.length / 7)} cal
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Per day this week
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Stats */}
            <HealthStats meals={meals} language={language} />

            {/* Today's Meals */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Meals</CardTitle>
              </CardHeader>
              <CardContent>
                {todaysMeals.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">🍽️</div>
                    <p className="text-lg font-medium text-gray-900 mb-2">No meals logged today</p>
                    <p className="text-gray-600 mb-4">Start tracking your nutrition to see your meals here</p>
                    <Button
                      onClick={() => setShowMealModal(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Meal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaysMeals.map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{meal.emoji}</span>
                          <div>
                            <div className="font-medium">{meal.name}</div>
                            <div className="text-sm text-gray-500">{meal.category}</div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {meal.calories} cal
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Meals */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Meals</CardTitle>
              </CardHeader>
              <CardContent>
                {meals.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">🍽️</div>
                    <p className="text-lg font-medium text-gray-900 mb-2">No meals logged yet</p>
                    <p className="text-gray-600 mb-4">Start tracking your nutrition to see your meal history</p>
                    <Button
                      onClick={() => setShowMealModal(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Meal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {meals.slice(0, 10).map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{meal.emoji}</span>
                          <div>
                            <div className="font-medium">{meal.name}</div>
                            <div className="text-sm text-gray-500">
                              {meal.category} • {new Date(meal.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {meal.calories} cal
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
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
