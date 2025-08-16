const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// @desc    Get user expenses with pagination and filters
// @route   GET /api/expenses
// @access  Public
const getExpenses = asyncHandler(async (req, res) => {
  const {
    userId,
    page = 1,
    limit = 10,
    category,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy = "date",
    sortOrder = "desc",
  } = req.query;

  if (!userId) {
    return sendError(res, 400, "User ID is required");
  }

  const filters = {};
  if (category) filters.category = category;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  if (minAmount) filters.minAmount = Number.parseFloat(minAmount);
  if (maxAmount) filters.maxAmount = Number.parseFloat(maxAmount);

  const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const query = { userId, isDeleted: false };

  // Apply filters
  if (filters.category) query.category = filters.category;
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }
  if (filters.minAmount || filters.maxAmount) {
    query.amount = {};
    if (filters.minAmount) query.amount.$gte = filters.minAmount;
    if (filters.maxAmount) query.amount.$lte = filters.maxAmount;
  }

  const expenses = await Expense.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number.parseInt(limit));

  const total = await Expense.countDocuments(query);
  const totalAmount = await Expense.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  sendResponse(res, 200, {
    expenses,
    pagination: {
      currentPage: Number.parseInt(page),
      totalPages: Math.ceil(total / Number.parseInt(limit)),
      totalExpenses: total,
      hasNext:
        Number.parseInt(page) < Math.ceil(total / Number.parseInt(limit)),
      hasPrev: Number.parseInt(page) > 1,
    },
    summary: {
      totalAmount: totalAmount[0]?.total || 0,
      averageAmount: total > 0 ? (totalAmount[0]?.total || 0) / total : 0,
    },
  });
});

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Public
const createExpense = asyncHandler(async (req, res) => {
  const {
    userId,
    amount,
    category,
    description,
    emoji,
    date,
    mood,
    location,
    currency,
    tags,
    paymentMethod,
  } = req.body;

  // Verify user exists
  let user;

  try {
    user = await User.findById(userId);
  } catch (error) {
    // Database not connected, use demo user
    if (userId === "507f1f77bcf86cd799439011") {
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
  }

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  const expenseData = {
    userId,
    amount,
    category,
    description,
    emoji,
    date: date ? new Date(date) : new Date(),
    mood,
    location,
    currency: currency || user.preferences.currency || "UZS",
    tags: tags || [],
    paymentMethod,
  };

  let expense;

  try {
    expense = await Expense.create(expenseData);
  } catch (error) {
    // Database not connected, create mock expense
    if (userId === "507f1f77bcf86cd799439011") {
      expense = {
        _id: new mongoose.Types.ObjectId(),
        ...expenseData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      throw error;
    }
  }

  // Update user's current balance
  user.currentBalance += amount;
  await user.save();

  // Award coins for tracking expense
  await user.addCoins(5);

  sendResponse(res, 201, { expense }, "Expense created successfully");
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Public
const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove fields that shouldn't be updated
  delete updateData.userId;
  delete updateData.createdAt;
  delete updateData.updatedAt;

  const expense = await Expense.findById(id);
  if (!expense || expense.isDeleted) {
    return sendError(res, 404, "Expense not found");
  }

  // Store old amount for balance adjustment
  const oldAmount = expense.amount;

  Object.assign(expense, updateData);
  await expense.save();

  // Update user's current balance if amount changed
  if (updateData.amount && updateData.amount !== oldAmount) {
    const user = await User.findById(expense.userId);
    if (user) {
      user.currentBalance = user.currentBalance - oldAmount + expense.amount;
      await user.save();
    }
  }

  sendResponse(res, 200, { expense }, "Expense updated successfully");
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Public
const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const expense = await Expense.findById(id);
  if (!expense || expense.isDeleted) {
    return sendError(res, 404, "Expense not found");
  }

  // Soft delete
  expense.isDeleted = true;
  await expense.save();

  // Update user's current balance
  const user = await User.findById(expense.userId);
  if (user) {
    user.currentBalance -= expense.amount;
    await user.save();
  }

  sendResponse(res, 200, { message: "Expense deleted successfully" });
});

// @desc    Get expense analytics
// @route   GET /api/expenses/analytics
// @access  Public
const getExpenseAnalytics = asyncHandler(async (req, res) => {
  const { userId, period = "month" } = req.query;

  if (!userId) {
    return sendError(res, 400, "User ID is required");
  }

  // Get category breakdown
  const categoryAnalytics = await Expense.getAnalytics(userId, period);

  // Get daily spending for the period
  const now = new Date();
  let startDate;
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
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const dailySpending = await Expense.aggregate([
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
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ]);

  // Get mood analysis
  const moodAnalysis = await Expense.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$mood",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
        avgAmount: { $avg: "$amount" },
      },
    },
  ]);

  // Get top spending days
  const topSpendingDays = await Expense.aggregate([
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
          dayOfWeek: { $dayOfWeek: "$date" },
        },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { totalAmount: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  // Calculate totals
  const totalExpenses = await Expense.countDocuments({
    userId,
    isDeleted: false,
    date: { $gte: startDate },
  });

  const totalAmount = categoryAnalytics.reduce(
    (sum, cat) => sum + cat.totalAmount,
    0
  );

  sendResponse(res, 200, {
    period,
    totalExpenses,
    totalAmount,
    averageDaily:
      dailySpending.length > 0 ? totalAmount / dailySpending.length : 0,
    categoryBreakdown: categoryAnalytics,
    dailySpending,
    moodAnalysis,
    topSpendingDays,
  });
});

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Public
const getExpenseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const expense = await Expense.findById(id);
  if (!expense || expense.isDeleted) {
    return sendError(res, 404, "Expense not found");
  }

  sendResponse(res, 200, { expense }, "Expense retrieved successfully");
});

// @desc    Get recent expenses
// @route   GET /api/expenses/recent
// @access  Public
const getRecentExpenses = asyncHandler(async (req, res) => {
  const { userId, limit = 5 } = req.query;

  if (!userId) {
    return sendError(res, 400, "User ID is required");
  }

  const expenses = await Expense.find({ userId, isDeleted: false })
    .sort({ date: -1 })
    .limit(Number.parseInt(limit));

  sendResponse(
    res,
    200,
    { expenses },
    "Recent expenses retrieved successfully"
  );
});

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseAnalytics,
  getExpenseById,
  getRecentExpenses,
};
