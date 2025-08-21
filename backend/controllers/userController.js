const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// @desc    Get all users (admin only) or search users
// @route   GET /api/users
// @access  Public (with pagination)
const getUsers = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page) || 1;
  const limit = Number.parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

  // Build search query
  const query = { isActive: true };
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select("-__v")
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  sendResponse(res, 200, {
    users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:userId
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).where({ isActive: true });

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  sendResponse(res, 200, { user }, "User retrieved successfully");
});

// @desc    Create new user
// @route   POST /api/users
// @access  Public
const createUser = asyncHandler(async (req, res) => {
  const {
    email,
    username,
    firstName,
    lastName,
    language,
    monthlyLimit,
    preferences,
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 400, "User with this email already exists");
  }

  const userData = {
    email,
    username,
    firstName,
    lastName,
    language: language || "uz",
    monthlyLimit: monthlyLimit || 1000000,
    preferences: {
      notifications: preferences?.notifications ?? true,
      currency: preferences?.currency || "UZS",
      theme: preferences?.theme || "light",
      dailyReminder: preferences?.dailyReminder ?? true,
      weeklyReport: preferences?.weeklyReport ?? true,
    },
  };

  const user = await User.create(userData);

  sendResponse(res, 201, { user }, "User created successfully");
});

// @desc    Update user profile
// @route   PUT /api/users/:userId
// @access  Public
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;

  // Remove fields that shouldn't be updated directly
  delete updateData.coins;
  delete updateData.level;
  delete updateData.streak;
  delete updateData.badges;
  delete updateData.joinedAt;
  delete updateData.createdAt;
  delete updateData.updatedAt;

  const user = await User.findByIdAndUpdate(
    userId,
    { ...updateData, lastActive: new Date() },
    {
      new: true,
      runValidators: true,
    }
  ).where({ isActive: true });

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  sendResponse(res, 200, { user }, "User updated successfully");
});

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:userId
// @access  Public
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false, lastActive: new Date() },
    { new: true }
  ).where({ isActive: true });

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  sendResponse(res, 200, { message: "User deleted successfully" });
});

// @desc    Get user statistics
// @route   GET /api/users/:userId/stats
// @access  Public
const getUserStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).where({ isActive: true });
  if (!user) {
    return sendError(res, 404, "User not found");
  }

  // Calculate additional stats
  const daysSinceJoined = Math.floor(
    (Date.now() - user.joinedAt) / (1000 * 60 * 60 * 24)
  );
  const averageCoinsPerDay =
    daysSinceJoined > 0 ? Math.round(user.coins / daysSinceJoined) : 0;

  const stats = {
    level: user.level,
    coins: user.coins,
    streak: user.streak,
    badges: user.badges,
    experiencePoints: user.experiencePoints,
    daysSinceJoined,
    averageCoinsPerDay,
    monthlyLimit: user.monthlyLimit,
    currentBalance: user.currentBalance,
    balancePercentage:
      user.monthlyLimit > 0
        ? Math.round((user.currentBalance / user.monthlyLimit) * 100)
        : 0,
  };

  sendResponse(res, 200, { stats }, "User statistics retrieved successfully");
});

// @desc    Add coins to user
// @route   POST /api/users/:userId/coins
// @access  Public
const addCoins = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { amount, reason } = req.body;

  if (!amount || amount <= 0) {
    return sendError(res, 400, "Amount must be a positive number");
  }

  const user = await User.findById(userId).where({ isActive: true });
  if (!user) {
    return sendError(res, 404, "User not found");
  }

  const oldLevel = user.level;
  await user.addCoins(amount);

  const response = {
    user,
    coinsAdded: amount,
    reason: reason || "Manual addition",
    leveledUp: user.level > oldLevel,
    newLevel: user.level,
  };

  sendResponse(res, 200, response, "Coins added successfully");
});

// @desc    Add badge to user
// @route   POST /api/users/:userId/badges
// @access  Public
const addBadge = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { badge } = req.body;

  if (!badge) {
    return sendError(res, 400, "Badge name is required");
  }

  const user = await User.findById(userId).where({ isActive: true });
  if (!user) {
    return sendError(res, 404, "User not found");
  }

  await user.addBadge(badge);

  sendResponse(res, 200, { user }, "Badge added successfully");
});

// @desc    Update user streak
// @route   POST /api/users/:userId/streak
// @access  Public
const updateStreak = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { increment = true } = req.body;

  const user = await User.findById(userId).where({ isActive: true });
  if (!user) {
    return sendError(res, 404, "User not found");
  }

  await user.updateStreak(increment);

  sendResponse(res, 200, { user }, "Streak updated successfully");
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  addCoins,
  addBadge,
  updateStreak,
};
