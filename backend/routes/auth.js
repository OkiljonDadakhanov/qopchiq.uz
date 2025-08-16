const express = require("express")
const router = express.Router()
const { body } = require("express-validator")
const { handleValidationErrors } = require("../utils/validation")
const {
  authenticateWithTelegram,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  registerWithEmail,
  loginWithEmail,
} = require("../controllers/authController")
// Email/password auth
router.post("/register", [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  handleValidationErrors,
], registerWithEmail);

router.post("/login", [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  handleValidationErrors,
], loginWithEmail);
const { authenticate, optionalAuth } = require("../middleware/auth")

// Validation rules
const telegramAuthValidation = [
  body("telegramId").isString().notEmpty().withMessage("Telegram ID is required"),
  body("username").optional().isString().isLength({ max: 50 }),
  body("firstName").optional().isString().isLength({ max: 50 }),
  body("lastName").optional().isString().isLength({ max: 50 }),
  body("language").optional().isIn(["uz", "en"]).withMessage("Language must be uz or en"),
  handleValidationErrors,
]

const updateProfileValidation = [
  body("username").optional().isString().isLength({ max: 50 }),
  body("firstName").optional().isString().isLength({ max: 50 }),
  body("lastName").optional().isString().isLength({ max: 50 }),
  body("language").optional().isIn(["uz", "en"]),
  body("monthlyLimit").optional().isNumeric().isFloat({ min: 0, max: 100000000 }),
  body("preferences").optional().isObject(),
  handleValidationErrors,
]

// Routes
router.post("/telegram", telegramAuthValidation, authenticateWithTelegram)
router.post("/refresh", refreshToken)
router.post("/logout", authenticate, logout)
router.get("/profile", authenticate, getProfile)
router.put("/profile", authenticate, updateProfileValidation, updateProfile)

// Health check with optional auth
router.get("/check", optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: "Auth service is running",
    authenticated: !!req.user,
    user: req.user
      ? {
          id: req.user._id,
          telegramId: req.user.telegramId,
          username: req.user.username,
          level: req.user.level,
        }
      : null,
  })
})

module.exports = router
