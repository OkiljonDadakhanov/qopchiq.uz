const express = require("express")
const router = express.Router()
const {
  earnCoins,
  getLeaderboard,
  levelUp,
  getBadges,
  getUserChallenges,
  joinChallenge,
  updateChallengeProgressEndpoint,
} = require("../controllers/gamificationController")

const { body, query } = require("express-validator")
const { handleValidationErrors } = require("../utils/validation")
const { authenticate, optionalAuth } = require("../middleware/auth")

// Validation rules
const earnCoinsValidation = [
  body("userId").isString().notEmpty().withMessage("User ID is required"),
  body("amount").isNumeric().isInt({ min: 1 }).withMessage("Amount must be a positive integer"),
  body("reason").isString().notEmpty().withMessage("Reason is required"),
  body("category").optional().isString().withMessage("Category must be a string"),
  handleValidationErrors,
]

const levelUpValidation = [
  body("userId").isString().notEmpty().withMessage("User ID is required"),
  handleValidationErrors,
]

const leaderboardValidation = [
  query("type").optional().isIn(["coins", "level", "streak"]).withMessage("Invalid leaderboard type"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("period").optional().isIn(["all", "week", "month"]).withMessage("Invalid period"),
  handleValidationErrors,
]

const badgesValidation = [
  query("userId").isString().notEmpty().withMessage("User ID is required"),
  query("category")
    .optional()
    .isIn(["expense", "meal", "health", "streak", "milestone", "special"])
    .withMessage("Invalid badge category"),
  handleValidationErrors,
]

const challengesValidation = [
  query("userId").isString().notEmpty().withMessage("User ID is required"),
  query("status").optional().isIn(["all", "active", "completed"]).withMessage("Invalid status"),
  handleValidationErrors,
]

const joinChallengeValidation = [
  body("userId").isString().notEmpty().withMessage("User ID is required"),
  body("challengeId").isMongoId().withMessage("Invalid challenge ID"),
  handleValidationErrors,
]

const updateProgressValidation = [
  body("userId").isString().notEmpty().withMessage("User ID is required"),
  body("challengeId").isMongoId().withMessage("Invalid challenge ID"),
  body("progress").isNumeric().isInt({ min: 0 }).withMessage("Progress must be a non-negative integer"),
  handleValidationErrors,
]

// Routes with optional JWT authentication
router.post("/earn-coins", optionalAuth, earnCoinsValidation, earnCoins)
router.get("/leaderboard", optionalAuth, leaderboardValidation, getLeaderboard)
router.post("/level-up", optionalAuth, levelUpValidation, levelUp)
router.get("/badges", optionalAuth, badgesValidation, getBadges)
router.get("/challenges", optionalAuth, challengesValidation, getUserChallenges)
router.post("/challenges/join", optionalAuth, joinChallengeValidation, joinChallenge)
router.post("/challenges/progress", optionalAuth, updateProgressValidation, updateChallengeProgressEndpoint)

module.exports = router
