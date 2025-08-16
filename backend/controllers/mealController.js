const Meal = require("../models/Meal")
const User = require("../models/User")
const asyncHandler = require("../utils/asyncHandler")
const { sendResponse, sendError } = require("../utils/apiResponse")

// @desc    Get user meals with pagination and filters
// @route   GET /api/meals
// @access  Public
const getMeals = asyncHandler(async (req, res) => {
  const {
    userId,
    page = 1,
    limit = 10,
    mealType,
    category,
    startDate,
    endDate,
    sortBy = "date",
    sortOrder = "desc",
  } = req.query

  if (!userId) {
    return sendError(res, 400, "User ID is required")
  }

  const query = { userId, isDeleted: false }

  // Apply filters
  if (mealType) query.mealType = mealType
  if (category) query.category = category
  if (startDate || endDate) {
    query.date = {}
    if (startDate) query.date.$gte = new Date(startDate)
    if (endDate) query.date.$lte = new Date(endDate)
  }

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 }

  const meals = await Meal.find(query).sort(sort).skip(skip).limit(Number.parseInt(limit))

  const total = await Meal.countDocuments(query)
  const totalCalories = await Meal.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$calories" } } },
  ])

  sendResponse(res, 200, {
    meals,
    pagination: {
      currentPage: Number.parseInt(page),
      totalPages: Math.ceil(total / Number.parseInt(limit)),
      totalMeals: total,
      hasNext: Number.parseInt(page) < Math.ceil(total / Number.parseInt(limit)),
      hasPrev: Number.parseInt(page) > 1,
    },
    summary: {
      totalCalories: totalCalories[0]?.total || 0,
      averageCalories: total > 0 ? (totalCalories[0]?.total || 0) / total : 0,
    },
  })
})

// @desc    Create new meal
// @route   POST /api/meals
// @access  Public
const createMeal = asyncHandler(async (req, res) => {
  const {
    userId,
    name,
    calories,
    emoji,
    date,
    category,
    mealType,
    notes,
    ingredients,
    nutritionInfo,
    rating,
    isHomemade,
    restaurant,
    cost,
  } = req.body

  // Verify user exists
  const user = await User.findByTelegramId(userId)
  if (!user) {
    return sendError(res, 404, "User not found")
  }

  const mealData = {
    userId,
    name,
    calories,
    emoji,
    date: date ? new Date(date) : new Date(),
    category,
    mealType,
    notes,
    ingredients: ingredients || [],
    nutritionInfo: nutritionInfo || {},
    rating,
    isHomemade: isHomemade !== undefined ? isHomemade : true,
    restaurant,
    cost,
  }

  const meal = await Meal.create(mealData)

  // Award coins for tracking meal
  await user.addCoins(3)

  sendResponse(res, 201, { meal }, "Meal created successfully")
})

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Public
const updateMeal = asyncHandler(async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  // Remove fields that shouldn't be updated
  delete updateData.userId
  delete updateData.createdAt
  delete updateData.updatedAt

  const meal = await Meal.findById(id)
  if (!meal || meal.isDeleted) {
    return sendError(res, 404, "Meal not found")
  }

  Object.assign(meal, updateData)
  await meal.save()

  sendResponse(res, 200, { meal }, "Meal updated successfully")
})

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Public
const deleteMeal = asyncHandler(async (req, res) => {
  const { id } = req.params

  const meal = await Meal.findById(id)
  if (!meal || meal.isDeleted) {
    return sendError(res, 404, "Meal not found")
  }

  // Soft delete
  meal.isDeleted = true
  await meal.save()

  sendResponse(res, 200, { message: "Meal deleted successfully" })
})

// @desc    Get meal analytics
// @route   GET /api/meals/analytics
// @access  Public
const getMealAnalytics = asyncHandler(async (req, res) => {
  const { userId, period = "month" } = req.query

  if (!userId) {
    return sendError(res, 400, "User ID is required")
  }

  // Get meal type breakdown
  const mealTypeAnalytics = await Meal.getAnalytics(userId, period)

  // Get category breakdown
  const now = new Date()
  let startDate
  switch (period) {
    case "week":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
      break
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const categoryAnalytics = await Meal.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$category",
        totalCalories: { $sum: "$calories" },
        count: { $sum: 1 },
        avgCalories: { $avg: "$calories" },
      },
    },
    {
      $sort: { totalCalories: -1 },
    },
  ])

  // Get daily calorie trends
  const dailyCalories = await Meal.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: startDate },
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
        totalProtein: { $sum: "$nutritionInfo.protein" },
        totalCarbs: { $sum: "$nutritionInfo.carbs" },
        totalFat: { $sum: "$nutritionInfo.fat" },
        mealCount: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ])

  // Get nutrition averages
  const nutritionAverages = await Meal.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        avgProtein: { $avg: "$nutritionInfo.protein" },
        avgCarbs: { $avg: "$nutritionInfo.carbs" },
        avgFat: { $avg: "$nutritionInfo.fat" },
        avgFiber: { $avg: "$nutritionInfo.fiber" },
        avgSugar: { $avg: "$nutritionInfo.sugar" },
        totalMeals: { $sum: 1 },
      },
    },
  ])

  // Calculate totals
  const totalMeals = await Meal.countDocuments({
    userId,
    isDeleted: false,
    date: { $gte: startDate },
  })

  const totalCalories = mealTypeAnalytics.reduce((sum, meal) => sum + meal.totalCalories, 0)

  sendResponse(res, 200, {
    period,
    totalMeals,
    totalCalories,
    averageDaily: dailyCalories.length > 0 ? totalCalories / dailyCalories.length : 0,
    mealTypeBreakdown: mealTypeAnalytics,
    categoryBreakdown: categoryAnalytics,
    dailyCalories,
    nutritionAverages: nutritionAverages[0] || {},
  })
})

// @desc    Get meal by ID
// @route   GET /api/meals/:id
// @access  Public
const getMealById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const meal = await Meal.findById(id)
  if (!meal || meal.isDeleted) {
    return sendError(res, 404, "Meal not found")
  }

  sendResponse(res, 200, { meal }, "Meal retrieved successfully")
})

// @desc    Get daily calorie intake
// @route   GET /api/meals/daily-calories
// @access  Public
const getDailyCalories = asyncHandler(async (req, res) => {
  const { userId, date } = req.query

  if (!userId) {
    return sendError(res, 400, "User ID is required")
  }

  const targetDate = date ? new Date(date) : new Date()
  const dailyCalories = await Meal.getDailyCalories(userId, targetDate)

  const result = dailyCalories[0] || {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    mealCount: 0,
  }

  // Get meals for the day
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)

  const meals = await Meal.find({
    userId,
    isDeleted: false,
    date: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ date: 1 })

  sendResponse(res, 200, {
    date: targetDate.toISOString().split("T")[0],
    summary: result,
    meals,
  })
})

// @desc    Get recent meals
// @route   GET /api/meals/recent
// @access  Public
const getRecentMeals = asyncHandler(async (req, res) => {
  const { userId, limit = 5 } = req.query

  if (!userId) {
    return sendError(res, 400, "User ID is required")
  }

  const meals = await Meal.find({ userId, isDeleted: false }).sort({ date: -1 }).limit(Number.parseInt(limit))

  sendResponse(res, 200, { meals }, "Recent meals retrieved successfully")
})

module.exports = {
  getMeals,
  createMeal,
  updateMeal,
  deleteMeal,
  getMealAnalytics,
  getMealById,
  getDailyCalories,
  getRecentMeals,
}
