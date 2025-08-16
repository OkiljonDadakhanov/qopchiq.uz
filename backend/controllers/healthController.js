const HealthMetric = require("../models/HealthMetric");
const WaterIntake = require("../models/WaterIntake");
const Exercise = require("../models/Exercise");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// @desc    Calculate and store BMI
// @route   POST /api/health/bmi
// @access  Public
const calculateBMI = asyncHandler(async (req, res) => {
  const { userId, height, weight, age, gender, activityLevel, notes } =
    req.body;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    return sendError(res, 404, "User not found");
  }

  const healthData = {
    userId,
    height,
    weight,
    age,
    gender,
    activityLevel,
    notes,
  };

  const healthMetric = await HealthMetric.create(healthData);

  // Award coins for health tracking
  await user.addCoins(10);

  // Generate health recommendations
  const recommendations = generateHealthRecommendations(healthMetric);

  sendResponse(
    res,
    201,
    {
      healthMetric,
      recommendations,
    },
    "BMI calculated and health metrics stored successfully"
  );
});

// @desc    Get user BMI history
// @route   GET /api/health/bmi/:userId
// @access  Public
const getBMIHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 10 } = req.query;

  const bmiHistory = await HealthMetric.getBMIHistory(
    userId,
    Number.parseInt(limit)
  );

  if (!bmiHistory.length) {
    return sendError(res, 404, "No BMI history found for this user");
  }

  // Calculate BMI trends
  const trends = calculateBMITrends(bmiHistory);

  sendResponse(res, 200, {
    history: bmiHistory,
    trends,
  });
});

// @desc    Get health metrics
// @route   GET /api/health/metrics
// @access  Public
const getHealthMetrics = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return sendError(res, 400, "User ID is required");
  }

  // Get latest health metrics
  const latestMetrics = await HealthMetric.getLatestByUser(userId);
  if (!latestMetrics) {
    return sendError(res, 404, "No health metrics found for this user");
  }

  // Get today's water intake
  const todayWater = await WaterIntake.getDailyIntake(userId);
  const waterIntake = todayWater[0] || { totalAmount: 0, entryCount: 0 };

  // Get this week's exercise summary
  const weeklyExercise = await Exercise.getWeeklySummary(userId);

  // Calculate health score
  const healthScore = calculateHealthScore(
    latestMetrics,
    waterIntake,
    weeklyExercise
  );

  // Generate recommendations
  const recommendations = generateHealthRecommendations(
    latestMetrics,
    waterIntake,
    weeklyExercise
  );

  sendResponse(res, 200, {
    metrics: latestMetrics,
    waterIntake,
    weeklyExercise,
    healthScore,
    recommendations,
  });
});

// @desc    Track water intake
// @route   POST /api/health/water
// @access  Public
const trackWaterIntake = asyncHandler(async (req, res) => {
  const { userId, amount, notes } = req.body;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    return sendError(res, 404, "User not found");
  }

  const waterData = {
    userId,
    amount,
    notes,
  };

  const waterIntake = await WaterIntake.create(waterData);

  // Award coins for water tracking
  await user.addCoins(2);

  // Get today's total water intake
  const todayTotal = await WaterIntake.getDailyIntake(userId);
  const totalToday = todayTotal[0]?.totalAmount || 0;

  // Check if daily goal is reached (2000ml recommended)
  const dailyGoal = 2000;
  const goalReached = totalToday >= dailyGoal;

  if (goalReached) {
    // Award bonus coins for reaching daily goal
    await user.addCoins(5);
  }

  sendResponse(res, 201, {
    waterIntake,
    todayTotal: totalToday,
    dailyGoal,
    goalReached,
  });
});

// @desc    Log exercise
// @route   POST /api/health/exercise
// @access  Public
const logExercise = asyncHandler(async (req, res) => {
  const { userId, name, type, duration, caloriesBurned, intensity, notes } =
    req.body;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    return sendError(res, 404, "User not found");
  }

  const exerciseData = {
    userId,
    name,
    type,
    duration,
    caloriesBurned,
    intensity,
    notes,
  };

  const exercise = await Exercise.create(exerciseData);

  // Award coins based on duration (1 coin per 10 minutes)
  const coinsEarned = Math.max(5, Math.floor(duration / 10));
  await user.addCoins(coinsEarned);

  sendResponse(
    res,
    201,
    { exercise, coinsEarned },
    "Exercise logged successfully"
  );
});

// @desc    Get exercise history
// @route   GET /api/health/exercise
// @access  Public
const getExerciseHistory = asyncHandler(async (req, res) => {
  const { userId, page = 1, limit = 10, type, startDate, endDate } = req.query;

  if (!userId) {
    return sendError(res, 400, "User ID is required");
  }

  const query = { userId, isDeleted: false };

  if (type) query.type = type;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

  const exercises = await Exercise.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(Number.parseInt(limit));

  const total = await Exercise.countDocuments(query);

  sendResponse(res, 200, {
    exercises,
    pagination: {
      currentPage: Number.parseInt(page),
      totalPages: Math.ceil(total / Number.parseInt(limit)),
      totalExercises: total,
      hasNext:
        Number.parseInt(page) < Math.ceil(total / Number.parseInt(limit)),
      hasPrev: Number.parseInt(page) > 1,
    },
  });
});

// Helper function to generate health recommendations
const generateHealthRecommendations = (
  healthMetric,
  waterIntake = null,
  weeklyExercise = null
) => {
  const recommendations = [];

  // BMI-based recommendations
  const bmiCategory = healthMetric.bmiCategory;
  switch (bmiCategory) {
    case "underweight":
      recommendations.push({
        type: "nutrition",
        priority: "high",
        message: "Consider increasing caloric intake with nutrient-dense foods",
        action: "Consult with a nutritionist for a healthy weight gain plan",
      });
      break;
    case "overweight":
      recommendations.push({
        type: "nutrition",
        priority: "medium",
        message: "Focus on balanced nutrition and portion control",
        action: "Aim for a gradual weight loss of 0.5-1 kg per week",
      });
      break;
    case "obese":
      recommendations.push({
        type: "nutrition",
        priority: "high",
        message: "Consider a structured weight management program",
        action:
          "Consult with healthcare professionals for a comprehensive plan",
      });
      break;
    default:
      recommendations.push({
        type: "nutrition",
        priority: "low",
        message: "Maintain your current healthy weight",
        action: "Continue with balanced nutrition and regular exercise",
      });
  }

  // Water intake recommendations
  if (waterIntake && waterIntake.totalAmount < 2000) {
    recommendations.push({
      type: "hydration",
      priority: "medium",
      message: `Increase water intake. You've had ${waterIntake.totalAmount}ml today`,
      action: "Aim for at least 2000ml of water daily",
    });
  }

  // Exercise recommendations
  if (weeklyExercise) {
    const totalDuration = weeklyExercise.reduce(
      (sum, ex) => sum + ex.totalDuration,
      0
    );
    if (totalDuration < 150) {
      // WHO recommends 150 minutes per week
      recommendations.push({
        type: "exercise",
        priority: "high",
        message: `You've exercised ${totalDuration} minutes this week`,
        action: "Aim for at least 150 minutes of moderate exercise per week",
      });
    }
  }

  // Calorie recommendations
  if (healthMetric.dailyCalorieNeeds) {
    recommendations.push({
      type: "nutrition",
      priority: "low",
      message: `Your estimated daily calorie needs: ${healthMetric.dailyCalorieNeeds} calories`,
      action: "Track your daily intake to maintain energy balance",
    });
  }

  return recommendations;
};

// Helper function to calculate BMI trends
const calculateBMITrends = (bmiHistory) => {
  if (bmiHistory.length < 2) {
    return { trend: "insufficient_data", change: 0 };
  }

  const latest = bmiHistory[0];
  const previous = bmiHistory[1];
  const change = latest.bmi - previous.bmi;

  let trend = "stable";
  if (change > 0.5) trend = "increasing";
  else if (change < -0.5) trend = "decreasing";

  return {
    trend,
    change: Math.round(change * 10) / 10,
    period: `${bmiHistory.length} records`,
  };
};

// Helper function to calculate health score
const calculateHealthScore = (healthMetric, waterIntake, weeklyExercise) => {
  let score = 0;
  const factors = [];

  // BMI score (40 points max)
  const bmiCategory = healthMetric.bmiCategory;
  let bmiScore = 0;
  switch (bmiCategory) {
    case "normal":
      bmiScore = 40;
      break;
    case "overweight":
    case "underweight":
      bmiScore = 25;
      break;
    case "obese":
      bmiScore = 10;
      break;
  }
  score += bmiScore;
  factors.push({ factor: "BMI", score: bmiScore, max: 40 });

  // Water intake score (30 points max)
  const waterScore = Math.min(
    30,
    Math.floor((waterIntake.totalAmount / 2000) * 30)
  );
  score += waterScore;
  factors.push({ factor: "Hydration", score: waterScore, max: 30 });

  // Exercise score (30 points max)
  const totalExercise = weeklyExercise.reduce(
    (sum, ex) => sum + ex.totalDuration,
    0
  );
  const exerciseScore = Math.min(30, Math.floor((totalExercise / 150) * 30));
  score += exerciseScore;
  factors.push({ factor: "Exercise", score: exerciseScore, max: 30 });

  return {
    totalScore: score,
    maxScore: 100,
    percentage: Math.round((score / 100) * 100),
    factors,
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

module.exports = {
  calculateBMI,
  getBMIHistory,
  getHealthMetrics,
  trackWaterIntake,
  logExercise,
  getExerciseHistory,
};
