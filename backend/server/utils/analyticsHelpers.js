// Additional utility functions for analytics

const moment = require("moment")

// Function to calculate moving averages
const calculateMovingAverage = (data, windowSize = 7) => {
  const result = []
  for (let i = windowSize - 1; i < data.length; i++) {
    const window = data.slice(i - windowSize + 1, i + 1)
    const average = window.reduce((sum, val) => sum + val, 0) / windowSize
    result.push(Math.round(average * 100) / 100)
  }
  return result
}

// Function to detect anomalies in spending
const detectSpendingAnomalies = (expenses) => {
  if (expenses.length < 10) return []

  const amounts = expenses.map((e) => e.amount)
  const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length
  const stdDev = Math.sqrt(variance)

  const threshold = mean + 2 * stdDev // 2 standard deviations

  return expenses.filter((expense) => expense.amount > threshold)
}

// Function to predict next month's spending
const predictNextMonthSpending = (monthlyData) => {
  if (monthlyData.length < 3) return null

  // Simple linear regression
  const n = monthlyData.length
  const sumX = monthlyData.reduce((sum, _, i) => sum + i, 0)
  const sumY = monthlyData.reduce((sum, val) => sum + val, 0)
  const sumXY = monthlyData.reduce((sum, val, i) => sum + i * val, 0)
  const sumXX = monthlyData.reduce((sum, _, i) => sum + i * i, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const nextMonthIndex = n
  const prediction = slope * nextMonthIndex + intercept

  return Math.max(0, Math.round(prediction))
}

// Function to calculate seasonal patterns
const calculateSeasonalPatterns = (data) => {
  const patterns = {
    monthly: {},
    weekly: {},
    daily: {},
  }

  data.forEach((item) => {
    const date = new Date(item.date)
    const month = date.getMonth()
    const dayOfWeek = date.getDay()
    const hour = date.getHours()

    // Monthly patterns
    patterns.monthly[month] = (patterns.monthly[month] || 0) + item.amount

    // Weekly patterns
    patterns.weekly[dayOfWeek] = (patterns.weekly[dayOfWeek] || 0) + item.amount

    // Daily patterns (by hour)
    patterns.daily[hour] = (patterns.daily[hour] || 0) + item.amount
  })

  return patterns
}

// Function to generate personalized insights
const generatePersonalizedInsights = (userData, historicalData) => {
  const insights = []

  // Spending velocity insight
  const recentSpending = historicalData.expenses.slice(-7)
  const avgRecentSpending = recentSpending.reduce((sum, exp) => sum + exp.amount, 0) / 7
  const historicalAvg =
    historicalData.expenses.reduce((sum, exp) => sum + exp.amount, 0) / historicalData.expenses.length

  if (avgRecentSpending > historicalAvg * 1.2) {
    insights.push({
      type: "warning",
      title: "Increased Spending Detected",
      message: "Your spending has increased by 20% compared to your average",
      recommendation: "Review your recent purchases and identify areas to cut back",
    })
  }

  // Meal consistency insight
  const mealFrequency = historicalData.meals.length / 30 // meals per day over last 30 days
  if (mealFrequency < 2) {
    insights.push({
      type: "health",
      title: "Meal Tracking Opportunity",
      message: "You're logging fewer than 2 meals per day on average",
      recommendation: "Try to log all your meals for better nutrition tracking",
    })
  }

  // Health progress insight
  if (historicalData.healthMetrics.length >= 2) {
    const latest = historicalData.healthMetrics[0]
    const previous = historicalData.healthMetrics[1]
    const bmiChange = latest.bmi - previous.bmi

    if (Math.abs(bmiChange) > 0.5) {
      insights.push({
        type: "health",
        title: "BMI Change Detected",
        message: `Your BMI has ${bmiChange > 0 ? "increased" : "decreased"} by ${Math.abs(bmiChange).toFixed(1)}`,
        recommendation:
          bmiChange > 0
            ? "Consider reviewing your diet and exercise routine"
            : "Great progress! Keep up the healthy habits",
      })
    }
  }

  return insights
}

// Function to calculate goal progress
const calculateGoalProgress = (current, target, timeframe) => {
  const progress = (current / target) * 100
  const daysInTimeframe = timeframe === "weekly" ? 7 : timeframe === "monthly" ? 30 : 365
  const currentDay = new Date().getDate()
  const expectedProgress = (currentDay / daysInTimeframe) * 100

  return {
    current,
    target,
    progress: Math.round(progress),
    expectedProgress: Math.round(expectedProgress),
    onTrack: progress >= expectedProgress * 0.9, // 90% of expected is considered on track
    projectedFinal: Math.round((current / currentDay) * daysInTimeframe),
  }
}

// Function to generate comparative analysis
const generateComparativeAnalysis = (currentPeriod, previousPeriod) => {
  const analysis = {}

  // Expense comparison
  if (currentPeriod.expenses && previousPeriod.expenses) {
    const currentTotal = currentPeriod.expenses.totalAmount
    const previousTotal = previousPeriod.expenses.totalAmount
    const change = ((currentTotal - previousTotal) / previousTotal) * 100

    analysis.expenses = {
      current: currentTotal,
      previous: previousTotal,
      change: Math.round(change),
      trend: change > 5 ? "increasing" : change < -5 ? "decreasing" : "stable",
    }
  }

  // Meal comparison
  if (currentPeriod.meals && previousPeriod.meals) {
    const currentCalories = currentPeriod.meals.totalCalories
    const previousCalories = previousPeriod.meals.totalCalories
    const change = ((currentCalories - previousCalories) / previousCalories) * 100

    analysis.meals = {
      current: currentCalories,
      previous: previousCalories,
      change: Math.round(change),
      trend: change > 5 ? "increasing" : change < -5 ? "decreasing" : "stable",
    }
  }

  return analysis
}

module.exports = {
  calculateMovingAverage,
  detectSpendingAnomalies,
  predictNextMonthSpending,
  calculateSeasonalPatterns,
  generatePersonalizedInsights,
  calculateGoalProgress,
  generateComparativeAnalysis,
}
