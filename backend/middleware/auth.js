const jwt = require("jsonwebtoken")
const User = require("../models/User")
const asyncHandler = require("../utils/asyncHandler")
const { sendError } = require("../utils/apiResponse")

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  })
}

// Verify JWT Token Middleware
const authenticate = asyncHandler(async (req, res, next) => {
  let token

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }
  // Check for token in cookies (optional)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token
  }

  if (!token) {
    return sendError(res, 401, "Access denied. No token provided.")
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from database
    const user = await User.findById(decoded.userId).select("-__v")

    if (!user || !user.isActive) {
      return sendError(res, 401, "Token is valid but user not found or inactive")
    }

    // Add user to request object
    req.user = user
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, "Token expired")
    } else if (error.name === "JsonWebTokenError") {
      return sendError(res, 401, "Invalid token")
    } else {
      return sendError(res, 401, "Token verification failed")
    }
  }
})

// Optional authentication - doesn't fail if no token
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId).select("-__v")

      if (user && user.isActive) {
        req.user = user
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log("Optional auth failed:", error.message)
    }
  }

  next()
})

// Check if user owns resource (for user-specific routes)
const authorize = (resourceField = "telegramId") => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, "Authentication required")
    }

    // Check if user is accessing their own resource
    const resourceId = req.params[resourceField] || req.body[resourceField]

    if (resourceId && req.user.telegramId !== resourceId) {
      return sendError(res, 403, "Access denied. You can only access your own resources.")
    }

    next()
  })
}

// Admin authorization (if needed)
const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, "Authentication required")
  }

  // Check if user has admin privileges (you can add admin field to User model)
  if (!req.user.isAdmin) {
    return sendError(res, 403, "Admin access required")
  }

  next()
})

module.exports = {
  generateToken,
  authenticate,
  optionalAuth,
  authorize,
  requireAdmin,
}
