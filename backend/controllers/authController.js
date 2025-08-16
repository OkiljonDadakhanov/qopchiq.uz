const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const { generateToken } = require("../middleware/auth");
const jwt = require("jsonwebtoken"); // Import jwt module
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Helper function to check if database is connected
const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

// @desc    Register user with email and password
// @route   POST /api/auth/register
// @access  Public
const registerWithEmail = asyncHandler(async (req, res) => {
  // Check if database is connected
  if (!isDatabaseConnected()) {
    return sendError(
      res,
      503,
      "Database is not available. Please try again later."
    );
  }

  const { email, password, username, firstName, lastName, language } = req.body;
  if (!email || !password) {
    return sendError(res, 400, "Email and password are required");
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return sendError(res, 400, "Email already registered");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashedPassword,
    username,
    firstName,
    lastName,
    language: language || "uz",
    lastActive: new Date(),
  });
  const token = generateToken(user._id);
  sendResponse(
    res,
    201,
    {
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        language: user.language,
      },
    },
    "Registration successful"
  );
});

// @desc    Login user with email and password
// @route   POST /api/auth/login
// @access  Public
const loginWithEmail = asyncHandler(async (req, res) => {
  // Check if database is connected
  if (!isDatabaseConnected()) {
    return sendError(
      res,
      503,
      "Database is not available. Please try again later."
    );
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 400, "Email and password are required");
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return sendError(res, 400, "Invalid email or password");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return sendError(res, 400, "Invalid email or password");
  }
  const token = generateToken(user._id);
  sendResponse(
    res,
    200,
    {
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        language: user.language,
      },
    },
    "Login successful"
  );
});

// @desc    Authenticate user with Telegram data and get JWT token
// @route   POST /api/auth/telegram
// @access  Public
const authenticateWithTelegram = asyncHandler(async (req, res) => {
  // Check if database is connected
  if (!isDatabaseConnected()) {
    return sendError(
      res,
      503,
      "Database is not available. Please try again later."
    );
  }

  const { telegramId, username, firstName, lastName, language, photoUrl } =
    req.body;

  try {
    // Find existing user or create new one
    let user = await User.findOne({ telegramId });

    if (user) {
      // Update existing user with latest Telegram data
      user.username = username || user.username;
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.language = language || user.language;
      user.lastActive = new Date();

      await user.save();
    } else {
      // Create new user
      user = await User.create({
        telegramId,
        username,
        firstName,
        lastName,
        language: language || "uz",
        lastActive: new Date(),
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Set cookie (optional)
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.cookie("token", token, cookieOptions);

    sendResponse(
      res,
      200,
      {
        token,
        user: {
          id: user._id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          language: user.language,
          level: user.level,
          coins: user.coins,
          streak: user.streak,
          badges: user.badges,
          preferences: user.preferences,
          lastActive: user.lastActive,
        },
      },
      "Authentication successful"
    );
  } catch (error) {
    console.error("Telegram auth error:", error);
    sendError(res, 500, "Authentication failed");
  }
});

// @desc    Refresh JWT token
// @route   POST /api/auth/refresh
// @access  Public (requires valid token)
const refreshToken = asyncHandler(async (req, res) => {
  // Check if database is connected
  if (!isDatabaseConnected()) {
    return sendError(
      res,
      503,
      "Database is not available. Please try again later."
    );
  }

  let token;

  // Get token from header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, 401, "No token provided");
  }

  try {
    // Try to verify the token first
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // If token is expired, try to decode it to get user ID
      decoded = jwt.decode(token);
      if (!decoded || !decoded.userId) {
        return sendError(res, 401, "Invalid token format");
      }
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return sendError(res, 401, "User not found or inactive");
    }

    // Generate new token
    const newToken = generateToken(user._id);

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Set new cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.cookie("token", newToken, cookieOptions);

    sendResponse(
      res,
      200,
      {
        token: newToken,
        user: {
          id: user._id,
          telegramId: user.telegramId,
          username: user.username,
          fullName: user.fullName,
          level: user.level,
          coins: user.coins,
        },
      },
      "Token refreshed successfully"
    );
  } catch (error) {
    console.error("Token refresh error:", error);
    sendError(res, 401, "Token refresh failed");
  }
});

// @desc    Logout user (clear cookie)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // Clear cookie
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  sendResponse(res, 200, {}, "Logged out successfully");
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  // Check if database is connected
  if (!isDatabaseConnected()) {
    return sendError(
      res,
      503,
      "Database is not available. Please try again later."
    );
  }

  const user = req.user;

  sendResponse(
    res,
    200,
    {
      user: {
        id: user._id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        language: user.language,
        monthlyLimit: user.monthlyLimit,
        currentBalance: user.currentBalance,
        level: user.level,
        coins: user.coins,
        streak: user.streak,
        badges: user.badges,
        preferences: user.preferences,
        experiencePoints: user.experiencePoints,
        lastActive: user.lastActive,
        joinedAt: user.joinedAt,
      },
    },
    "Profile retrieved successfully"
  );
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  // Check if database is connected
  if (!isDatabaseConnected()) {
    return sendError(
      res,
      503,
      "Database is not available. Please try again later."
    );
  }

  const user = req.user;
  const updateData = req.body;

  // Remove fields that shouldn't be updated
  delete updateData.telegramId;
  delete updateData.coins;
  delete updateData.level;
  delete updateData.streak;
  delete updateData.badges;
  delete updateData.joinedAt;

  // Update user
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      user[key] = updateData[key];
    }
  });

  user.lastActive = new Date();
  await user.save();

  sendResponse(
    res,
    200,
    {
      user: {
        id: user._id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        language: user.language,
        monthlyLimit: user.monthlyLimit,
        currentBalance: user.currentBalance,
        level: user.level,
        coins: user.coins,
        streak: user.streak,
        badges: user.badges,
        preferences: user.preferences,
        lastActive: user.lastActive,
      },
    },
    "Profile updated successfully"
  );
});

module.exports = {
  authenticateWithTelegram,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  registerWithEmail,
  loginWithEmail,
};
