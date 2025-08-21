const User = require("../models/User");
const Expense = require("../models/Expense");
const Meal = require("../models/Meal");
const HealthMetric = require("../models/HealthMetric");
const WaterIntake = require("../models/WaterIntake");
const Exercise = require("../models/Exercise");
const Achievement = require("../models/Achievement");
const UserChallenge = require("../models/UserChallenge");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// @desc    Get comprehensive analytics overview
// @route   GET /api/analytics/overview
// @access  Public
const getOverview = asyncHandler(async (req, res) => {
  const { userId, period = "month" } = req.query;

  if (!userId) {
    return sendError(res, 400, "User ID is required");
  }

  // Get date range based on period
  const dateRange = getDateRange(period);

  // Get user info
  let user = await User.findById(userId);

  // Handle demo user
  if (!user && userId === "507f1f77bcf86cd799439011") {
    user = {
      _id: "507f1f77bcf86cd799439011",
      email: "demo@qopchiq.uz",
      username: "demo_user",
      firstName: "Demo",
      lastName: "User",
      language: "uz",
      monthlyLimit: 1000000,
      currentBalance: 500000,
      level: 5,
      coins: 150,
      streak: 7,
      badges: ["first_expense", "savings_master"],
      preferences: {
        notifications: true,
        currency: "UZS",
        theme: "light",
        dailyReminder: true,
        weeklyReport: true,
      },
      addCoins: async function (amount) {
        this.coins += amount;
        return this;
      },
      save: async function () {
        return this;
      },
    };
  }

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  // Parallel data fetching for better performance
  const [
    expenseStats,
    mealStats,
    healthStats,
    gamificationStats,
    trendsData,
    insights,
  ] = await Promise.all([
    getExpenseStats(userId, dateRange),
    getMealStats(userId, dateRange),
    getHealthStats(userId, dateRange),
    getGamificationStats(userId, dateRange),
    getTrendsData(userId, dateRange),
    generateInsights(userId, dateRange),
  ]);

  const overview = {
    period,
    dateRange,
    user: {
      id: user._id,
      name: user.fullName,
      level: user.level,
      coins: user.coins,
      streak: user.streak,
    },
    expenses: expenseStats,
    meals: mealStats,
    health: healthStats,
    gamification: gamificationStats,
    trends: trendsData,
    insights,
    lastUpdated: new Date(),
  };

  sendResponse(res, 200, overview, "Analytics overview retrieved successfully");
});

// @desc    Get expense analytics by period
// @route   GET /api/analytics/expenses
// @access  Public
const getExpenseAnalytics = asyncHandler(async (req, res) => {
  const { userId, period = "month", category, comparison = false } = req.query;

  if (!userId) {
    return sendError(res, 400, "User ID is required");
  }

  const dateRange = getDateRange(period);
  const query = {
    userId,
    isDeleted: false,
    date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
  };

  if (category) query.category = category;

  // Get current period data
  const currentData = await getDetailedExpenseAnalytics(query);

  let comparisonData = null;
  if (comparison) {
    const previousRange = getPreviousDateRange(period);
    const previousQuery = {
      ...query,
      date: { $gte: previousRange.startDate, $lte: previousRange.endDate },
    };
    comparisonData = await getDetailedExpenseAnalytics(previousQuery);
  }

  // Get spending patterns
  const spendingPatterns = await getSpendingPatterns(userId, dateRange);

  // Get budget analysis
  let user = await User.findById(userId);

  // Handle demo user
  if (!user && userId === "507f1f77bcf86cd799439011") {
    user = {
      _id: "507f1f77bcf86cd799439011",
      email: "demo@qopchiq.uz",
      username: "demo_user",
      firstName: "Demo",
      lastName: "User",
      language: "uz",
      monthlyLimit: 1000000,
      currentBalance: 500000,
      level: 5,
      coins: 150,
      streak: 7,
      badges: ["first_expense", "savings_master"],
      preferences: {
        notifications: true,
        currency: "UZS",
        theme: "light",
        dailyReminder: true,
        weeklyReport: true,
      },
      addCoins: async function (amount) {
        this.coins += amount;
        return this;
      },
      save: async function () {
        return this;
      },
    };
  }

  const budgetAnalysis = analyzeBudget(
    currentData.totalAmount,
    user.monthlyLimit,
    period
  );

  sendResponse(res, 200, {
    period,
    dateRange,
    current: currentData,
    previous: comparisonData,
    spendingPatterns,
    budgetAnalysis,
    recommendations: generateExpenseRecommendations(
      currentData,
      budgetAnalysis
    ),
  });
});

// @desc    Get meal analytics by period
// @route   GET /api/analytics/meals
// @access  Public
const getMealAnalytics = asyncHandler(async (req, res) => {
  const { userId, period = "month", comparison = false } = req.query;

  if (!userId) {
    return sendError(res, 400, "User ID is required");
  }

  const dateRange = getDateRange(period);
  const query = {
    userId,
    isDeleted: false,
    date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
  };

  // Get current period data
  const currentData = await getDetailedMealAnalytics(query);

  let comparisonData = null;
  if (comparison) {
    const previousRange = getPreviousDateRange(period);
    const previousQuery = {
      ...query,
      date: { $gte: previousRange.startDate, $lte: previousRange.endDate },
    };
    comparisonData = await getDetailedMealAnalytics(previousQuery);
  }

  // Get nutrition patterns
  const nutritionPatterns = await getNutritionPatterns(userId, dateRange);

  // Get calorie goals analysis
  let user = await User.findById(userId);

  // Handle demo user
  if (!user && userId === "507f1f77bcf86cd799439011") {
    user = {
      _id: "507f1f77bcf86cd799439011",
      email: "demo@qopchiq.uz",
      username: "demo_user",
      firstName: "Demo",
      lastName: "User",
      language: "uz",
      monthlyLimit: 1000000,
      currentBalance: 500000,
      level: 5,
      coins: 150,
      streak: 7,
      badges: ["first_expense", "savings_master"],
      preferences: {
        notifications: true,
        currency: "UZS",
        theme: "light",
        dailyReminder: true,
        weeklyReport: true,
      },
      addCoins: async function (amount) {
        this.coins += amount;
        return this;
      },
      save: async function () {
        return this;
      },
    };
  }
  const latestHealth = await HealthMetric.getLatestByUser(userId);
  const calorieGoal = latestHealth?.dailyCalorieNeeds || 2000;
  const calorieAnalysis = analyzeCalorieIntake(
    currentData.avgDailyCalories,
    calorieGoal
  );

  sendResponse(res, 200, {
    period,
    dateRange,
    current: currentData,
    previous: comparisonData,
    nutritionPatterns,
    calorieAnalysis,
    recommendations: generateMealRecommendations(currentData, calorieAnalysis),
  });
});

// @desc    Get health analytics
// @route   GET /api/analytics/health
// @access  Public
const getHealthAnalytics = asyncHandler(async (req, res) => {
  const { userId, period = "month" } = req.query;

  if (!userId) {
    return sendError(res, 400, "User ID is required");
  }

  const dateRange = getDateRange(period);

  // Get health metrics history
  const healthHistory = await HealthMetric.find({
    userId,
    isDeleted: false,
    date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
  }).sort({ date: -1 });

  // Get water intake data
  const waterData = await WaterIntake.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
        totalAmount: { $sum: "$amount" },
        entryCount: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  // Get exercise data
  const exerciseData = await Exercise.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      },
    },
    {
      $group: {
        _id: "$type",
        totalDuration: { $sum: "$duration" },
        totalCalories: { $sum: "$caloriesBurned" },
        sessionCount: { $sum: 1 },
        avgDuration: { $avg: "$duration" },
      },
    },
  ]);

  // Calculate health trends
  const healthTrends = calculateHealthTrends(
    healthHistory,
    waterData,
    exerciseData
  );

  // Get latest health score
  const latestHealth = healthHistory[0];
  const healthScore = latestHealth
    ? calculateHealthScore(latestHealth, waterData, exerciseData)
    : null;

  sendResponse(res, 200, {
    period,
    dateRange,
    healthHistory,
    waterIntake: {
      dailyData: waterData,
      avgDaily:
        waterData.length > 0
          ? waterData.reduce((sum, day) => sum + day.totalAmount, 0) /
            waterData.length
          : 0,
      totalDays: waterData.length,
    },
    exercise: {
      byType: exerciseData,
      totalDuration: exerciseData.reduce(
        (sum, ex) => sum + ex.totalDuration,
        0
      ),
      totalCalories: exerciseData.reduce(
        (sum, ex) => sum + ex.totalCalories,
        0
      ),
      totalSessions: exerciseData.reduce((sum, ex) => sum + ex.sessionCount, 0),
    },
    trends: healthTrends,
    healthScore,
    recommendations: generateHealthRecommendations(
      latestHealth,
      waterData,
      exerciseData
    ),
  });
});

// Helper function to get date range based on period
const getDateRange = (period) => {
  const now = new Date();
  let startDate,
    endDate = new Date(now);

  switch (period) {
    case "week":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      );
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "quarter":
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { startDate, endDate };
};

// Helper function to get previous date range for comparison
const getPreviousDateRange = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case "week":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 14
      );
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "quarter":
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() - 3, 0);
      break;
    case "year":
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
  }

  return { startDate, endDate };
};

// Helper function to get expense statistics
const getExpenseStats = async (userId, dateRange) => {
  const expenses = await Expense.find({
    userId,
    isDeleted: false,
    date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
  });

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;

  const categoryBreakdown = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  return {
    totalExpenses: expenses.length,
    totalAmount,
    avgAmount: Math.round(avgAmount),
    categoryBreakdown,
    topCategory: Object.keys(categoryBreakdown).reduce(
      (a, b) => (categoryBreakdown[a] > categoryBreakdown[b] ? a : b),
      Object.keys(categoryBreakdown)[0]
    ),
  };
};

// Helper function to get meal statistics
const getMealStats = async (userId, dateRange) => {
  const meals = await Meal.find({
    userId,
    isDeleted: false,
    date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
  });

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const avgCalories = meals.length > 0 ? totalCalories / meals.length : 0;

  const mealTypeBreakdown = meals.reduce((acc, meal) => {
    acc[meal.mealType] = (acc[meal.mealType] || 0) + 1;
    return acc;
  }, {});

  const days = Math.ceil(
    (dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24)
  );
  const avgDailyCalories = days > 0 ? totalCalories / days : 0;

  return {
    totalMeals: meals.length,
    totalCalories,
    avgCalories: Math.round(avgCalories),
    avgDailyCalories: Math.round(avgDailyCalories),
    mealTypeBreakdown,
  };
};

// Helper function to get health statistics
const getHealthStats = async (userId, dateRange) => {
  const latestHealth = await HealthMetric.getLatestByUser(userId);
  const waterToday = await WaterIntake.getDailyIntake(userId);
  const weeklyExercise = await Exercise.getWeeklySummary(userId);

  return {
    currentBMI: latestHealth?.bmi || null,
    bmiCategory: latestHealth?.bmiCategory || null,
    waterToday: waterToday[0]?.totalAmount || 0,
    weeklyExercise: weeklyExercise.reduce(
      (sum, ex) => sum + ex.totalDuration,
      0
    ),
    healthScore: latestHealth
      ? calculateHealthScore(latestHealth, waterToday, weeklyExercise)
      : null,
  };
};

// Helper function to get gamification statistics
const getGamificationStats = async (userId, dateRange) => {
  const achievements = await Achievement.find({
    userId,
    isDeleted: false,
    unlockedAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
  });

  const completedChallenges = await UserChallenge.find({
    userId,
    isCompleted: true,
    completedAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
  });

  return {
    newAchievements: achievements.length,
    completedChallenges: completedChallenges.length,
    coinsEarned: achievements.reduce(
      (sum, achievement) => sum + achievement.coinsRewarded,
      0
    ),
  };
};

// Helper function to get trends data
const getTrendsData = async (userId, dateRange) => {
  // Get daily aggregated data for trends
  const dailyExpenses = await Expense.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const dailyCalories = await Meal.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
        totalCalories: { $sum: "$calories" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  return {
    dailyExpenses,
    dailyCalories,
    expenseTrend: calculateTrend(dailyExpenses.map((d) => d.totalAmount)),
    calorieTrend: calculateTrend(dailyCalories.map((d) => d.totalCalories)),
  };
};

// Helper function to calculate trend direction
const calculateTrend = (data) => {
  if (data.length < 2) return "insufficient_data";

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstAvg =
    firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const change = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (change > 5) return "increasing";
  if (change < -5) return "decreasing";
  return "stable";
};

// Helper function to generate insights
const generateInsights = async (userId, dateRange) => {
  const insights = [];

  // Get user data
  let user = await User.findById(userId);

  // Handle demo user
  if (!user && userId === "507f1f77bcf86cd799439011") {
    user = {
      _id: "507f1f77bcf86cd799439011",
      email: "demo@qopchiq.uz",
      username: "demo_user",
      firstName: "Demo",
      lastName: "User",
      language: "uz",
      monthlyLimit: 1000000,
      currentBalance: 500000,
      level: 5,
      coins: 150,
      streak: 7,
      badges: ["first_expense", "savings_master"],
      preferences: {
        notifications: true,
        currency: "UZS",
        theme: "light",
        dailyReminder: true,
        weeklyReport: true,
      },
      addCoins: async function (amount) {
        this.coins += amount;
        return this;
      },
      save: async function () {
        return this;
      },
    };
  }
  const expenses = await Expense.find({
    userId,
    isDeleted: false,
    date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
  });

  // Budget insight
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetUsage = (totalSpent / user.monthlyLimit) * 100;

  if (budgetUsage > 90) {
    insights.push({
      type: "warning",
      category: "budget",
      title: "Budget Alert",
      message: `You've used ${Math.round(budgetUsage)}% of your monthly budget`,
      priority: "high",
    });
  } else if (budgetUsage < 50) {
    insights.push({
      type: "positive",
      category: "budget",
      title: "Great Budgeting",
      message: `You're doing well! Only ${Math.round(
        budgetUsage
      )}% of budget used`,
      priority: "low",
    });
  }

  // Streak insight
  if (user.streak >= 7) {
    insights.push({
      type: "achievement",
      category: "streak",
      title: "Streak Master",
      message: `Amazing! You're on a ${user.streak}-day streak`,
      priority: "medium",
    });
  }

  // Spending pattern insight
  const categorySpending = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const topCategory = Object.keys(categorySpending).reduce(
    (a, b) => (categorySpending[a] > categorySpending[b] ? a : b),
    Object.keys(categorySpending)[0]
  );

  if (topCategory && categorySpending[topCategory] > totalSpent * 0.4) {
    insights.push({
      type: "info",
      category: "spending",
      title: "Spending Pattern",
      message: `${Math.round(
        (categorySpending[topCategory] / totalSpent) * 100
      )}% of your spending is on ${topCategory}`,
      priority: "medium",
    });
  }

  return insights;
};

// Helper function to get detailed expense analytics
const getDetailedExpenseAnalytics = async (query) => {
  const expenses = await Expense.find(query);

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const categoryBreakdown = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const moodAnalysis = expenses.reduce((acc, expense) => {
    acc[expense.mood] = (acc[expense.mood] || 0) + expense.amount;
    return acc;
  }, {});

  return {
    totalExpenses: expenses.length,
    totalAmount,
    avgAmount: expenses.length > 0 ? totalAmount / expenses.length : 0,
    categoryBreakdown,
    moodAnalysis,
    topSpendingDay: getTopSpendingDay(expenses),
  };
};

// Helper function to get detailed meal analytics
const getDetailedMealAnalytics = async (query) => {
  const meals = await Meal.find(query);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const mealTypeBreakdown = meals.reduce((acc, meal) => {
    acc[meal.mealType] = (acc[meal.mealType] || 0) + meal.calories;
    return acc;
  }, {});

  const nutritionTotals = meals.reduce(
    (acc, meal) => {
      acc.protein += meal.nutritionInfo.protein || 0;
      acc.carbs += meal.nutritionInfo.carbs || 0;
      acc.fat += meal.nutritionInfo.fat || 0;
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 }
  );

  const days = Math.ceil(
    (query.date.$lte - query.date.$gte) / (1000 * 60 * 60 * 24)
  );

  return {
    totalMeals: meals.length,
    totalCalories,
    avgCalories: meals.length > 0 ? totalCalories / meals.length : 0,
    avgDailyCalories: days > 0 ? totalCalories / days : 0,
    mealTypeBreakdown,
    nutritionTotals,
    macroPercentages: calculateMacroPercentages(nutritionTotals),
  };
};

// Helper function to calculate macro percentages
const calculateMacroPercentages = (nutrition) => {
  const totalCalories =
    nutrition.protein * 4 + nutrition.carbs * 4 + nutrition.fat * 9;

  if (totalCalories === 0) return { protein: 0, carbs: 0, fat: 0 };

  return {
    protein: Math.round(((nutrition.protein * 4) / totalCalories) * 100),
    carbs: Math.round(((nutrition.carbs * 4) / totalCalories) * 100),
    fat: Math.round(((nutrition.fat * 9) / totalCalories) * 100),
  };
};

// Helper function to calculate health score
const calculateHealthScore = (healthMetric, waterIntake, weeklyExercise) => {
  let score = 0;

  // BMI score (40 points)
  const bmiCategory = healthMetric.bmiCategory;
  switch (bmiCategory) {
    case "normal":
      score += 40;
      break;
    case "overweight":
    case "underweight":
      score += 25;
      break;
    case "obese":
      score += 10;
      break;
  }

  // Water score (30 points)
  const waterAmount = waterIntake[0]?.totalAmount || 0;
  score += Math.min(30, Math.floor((waterAmount / 2000) * 30));

  // Exercise score (30 points)
  const totalExercise = weeklyExercise.reduce(
    (sum, ex) => sum + ex.totalDuration,
    0
  );
  score += Math.min(30, Math.floor((totalExercise / 150) * 30));

  return {
    totalScore: score,
    percentage: Math.round((score / 100) * 100),
    rating:
      score >= 80
        ? "excellent"
        : score >= 60
        ? "good"
        : score >= 40
        ? "fair"
        : "needs_improvement",
  };
};

// Helper function to get top spending day
const getTopSpendingDay = (expenses) => {
  const dailySpending = expenses.reduce((acc, expense) => {
    const day = expense.date.toISOString().split("T")[0];
    acc[day] = (acc[day] || 0) + expense.amount;
    return acc;
  }, {});

  const topDay = Object.keys(dailySpending).reduce(
    (a, b) => (dailySpending[a] > dailySpending[b] ? a : b),
    Object.keys(dailySpending)[0]
  );

  return topDay ? { date: topDay, amount: dailySpending[topDay] } : null;
};

// Helper functions for recommendations
const generateExpenseRecommendations = (data, budgetAnalysis) => {
  const recommendations = [];

  if (budgetAnalysis.usage > 80) {
    recommendations.push(
      "Consider reducing spending in your top category to stay within budget"
    );
  }

  if (data.avgAmount > 50000) {
    recommendations.push(
      "Try to break down large expenses into smaller, more manageable amounts"
    );
  }

  return recommendations;
};

const generateMealRecommendations = (data, calorieAnalysis) => {
  const recommendations = [];

  if (data.avgDailyCalories < 1500) {
    recommendations.push(
      "Consider increasing your daily calorie intake for better health"
    );
  } else if (data.avgDailyCalories > 2500) {
    recommendations.push(
      "Consider reducing portion sizes or choosing lower-calorie options"
    );
  }

  return recommendations;
};

const generateHealthRecommendations = (
  healthMetric,
  waterData,
  exerciseData
) => {
  const recommendations = [];

  if (healthMetric && healthMetric.bmiCategory !== "normal") {
    recommendations.push(
      "Consider consulting with a healthcare professional about your BMI"
    );
  }

  const avgWater =
    waterData.length > 0
      ? waterData.reduce((sum, day) => sum + day.totalAmount, 0) /
        waterData.length
      : 0;
  if (avgWater < 2000) {
    recommendations.push("Increase your daily water intake to at least 2000ml");
  }

  const totalExercise = exerciseData.reduce(
    (sum, ex) => sum + ex.totalDuration,
    0
  );
  if (totalExercise < 150) {
    recommendations.push("Aim for at least 150 minutes of exercise per week");
  }

  return recommendations;
};

// Additional helper functions
const getSpendingPatterns = async (userId, dateRange) => {
  return await Expense.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$date" },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
        avgAmount: { $avg: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

const getNutritionPatterns = async (userId, dateRange) => {
  return await Meal.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      },
    },
    {
      $group: {
        _id: "$mealType",
        avgCalories: { $avg: "$calories" },
        avgProtein: { $avg: "$nutritionInfo.protein" },
        avgCarbs: { $avg: "$nutritionInfo.carbs" },
        avgFat: { $avg: "$nutritionInfo.fat" },
        count: { $sum: 1 },
      },
    },
  ]);
};

const analyzeBudget = (spent, limit, period) => {
  const usage = (spent / limit) * 100;
  let status = "good";

  if (usage > 90) status = "critical";
  else if (usage > 75) status = "warning";
  else if (usage < 50) status = "excellent";

  return {
    spent,
    limit,
    remaining: limit - spent,
    usage: Math.round(usage),
    status,
  };
};

const analyzeCalorieIntake = (avgDaily, goal) => {
  const percentage = (avgDaily / goal) * 100;
  let status = "good";

  if (percentage < 80) status = "low";
  else if (percentage > 120) status = "high";

  return {
    avgDaily: Math.round(avgDaily),
    goal,
    difference: Math.round(avgDaily - goal),
    percentage: Math.round(percentage),
    status,
  };
};

const calculateHealthTrends = (healthHistory, waterData, exerciseData) => {
  const trends = {};

  // BMI trend
  if (healthHistory.length >= 2) {
    const latest = healthHistory[0].bmi;
    const previous = healthHistory[1].bmi;
    const change = latest - previous;
    trends.bmi = {
      current: latest,
      change: Math.round(change * 10) / 10,
      direction:
        change > 0.1 ? "increasing" : change < -0.1 ? "decreasing" : "stable",
    };
  }

  // Water trend
  if (waterData.length >= 7) {
    const recent =
      waterData.slice(-7).reduce((sum, day) => sum + day.totalAmount, 0) / 7;
    const earlier =
      waterData.slice(0, 7).reduce((sum, day) => sum + day.totalAmount, 0) / 7;
    const change = recent - earlier;
    trends.water = {
      current: Math.round(recent),
      change: Math.round(change),
      direction:
        change > 100 ? "increasing" : change < -100 ? "decreasing" : "stable",
    };
  }

  return trends;
};

module.exports = {
  getOverview,
  getExpenseAnalytics,
  getMealAnalytics,
  getHealthAnalytics,
};
