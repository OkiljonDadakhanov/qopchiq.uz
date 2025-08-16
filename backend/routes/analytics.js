const express = require("express")
const router = express.Router()
const {
  getOverview,
  getExpenseAnalytics,
  getMealAnalytics,
  getHealthAnalytics,
} = require("../controllers/analyticsController")

const { query } = require("express-validator")
const { handleValidationErrors } = require("../utils/validation")

// Validation rules
const overviewValidation = [
  query("userId").isString().notEmpty().withMessage("User ID is required"),
  query("period").optional().isIn(["week", "month", "quarter", "year"]).withMessage("Invalid period"),
  handleValidationErrors,
]

const expenseAnalyticsValidation = [
  query("userId").isString().notEmpty().withMessage("User ID is required"),
  query("period").optional().isIn(["week", "month", "quarter", "year"]).withMessage("Invalid period"),
  query("category")
    .optional()
    .isIn([
      "food",
      "transport",
      "shopping",
      "entertainment",
      "bills",
      "health",
      "education",
      "travel",
      "gifts",
      "other",
    ])
    .withMessage("Invalid category"),
  query("comparison").optional().isBoolean().withMessage("Comparison must be a boolean"),
  handleValidationErrors,
]

const mealAnalyticsValidation = [
  query("userId").isString().notEmpty().withMessage("User ID is required"),
  query("period").optional().isIn(["week", "month", "quarter", "year"]).withMessage("Invalid period"),
  query("comparison").optional().isBoolean().withMessage("Comparison must be a boolean"),
  handleValidationErrors,
]

const healthAnalyticsValidation = [
  query("userId").isString().notEmpty().withMessage("User ID is required"),
  query("period").optional().isIn(["week", "month", "quarter", "year"]).withMessage("Invalid period"),
  handleValidationErrors,
]

// Routes
router.get("/overview", overviewValidation, getOverview)
router.get("/expenses", expenseAnalyticsValidation, getExpenseAnalytics)
router.get("/meals", mealAnalyticsValidation, getMealAnalytics)
router.get("/health", healthAnalyticsValidation, getHealthAnalytics)

module.exports = router
