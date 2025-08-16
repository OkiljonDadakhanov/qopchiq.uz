const express = require("express")
const router = express.Router()
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseAnalytics,
  getExpenseById,
  getRecentExpenses,
} = require("../controllers/expenseController")

const { body, param, query } = require("express-validator")
const { handleValidationErrors } = require("../utils/validation")
const { authenticate, optionalAuth } = require("../middleware/auth")

// Validation rules
const createExpenseValidation = [
  body("userId").isString().notEmpty().withMessage("User ID is required"),
  body("amount").isNumeric().isFloat({ min: 0.01 }).withMessage("Amount must be greater than 0"),
  body("category")
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
  body("description")
    .isString()
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage("Description is required and must be less than 200 characters"),
  body("emoji").optional().isString().isLength({ max: 10 }).withMessage("Emoji field is too long"),
  body("date").optional().isISO8601().withMessage("Date must be in ISO format"),
  body("mood").optional().isIn(["happy", "neutral", "sad", "stressed"]).withMessage("Invalid mood"),
  body("location")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Location must be less than 100 characters"),
  body("currency").optional().isIn(["UZS", "USD", "EUR", "RUB"]).withMessage("Invalid currency"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("paymentMethod")
    .optional()
    .isIn(["cash", "card", "bank_transfer", "digital_wallet", "other"])
    .withMessage("Invalid payment method"),
  handleValidationErrors,
]

const updateExpenseValidation = [
  param("id").isMongoId().withMessage("Invalid expense ID"),
  body("amount").optional().isNumeric().isFloat({ min: 0.01 }).withMessage("Amount must be greater than 0"),
  body("category")
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
  body("description")
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage("Description must be less than 200 characters"),
  body("emoji").optional().isString().isLength({ max: 10 }).withMessage("Emoji field is too long"),
  body("date").optional().isISO8601().withMessage("Date must be in ISO format"),
  body("mood").optional().isIn(["happy", "neutral", "sad", "stressed"]).withMessage("Invalid mood"),
  body("location")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Location must be less than 100 characters"),
  body("currency").optional().isIn(["UZS", "USD", "EUR", "RUB"]).withMessage("Invalid currency"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("paymentMethod")
    .optional()
    .isIn(["cash", "card", "bank_transfer", "digital_wallet", "other"])
    .withMessage("Invalid payment method"),
  handleValidationErrors,
]

const expenseIdValidation = [param("id").isMongoId().withMessage("Invalid expense ID"), handleValidationErrors]

const userIdQueryValidation = [
  query("userId").isString().notEmpty().withMessage("User ID is required"),
  handleValidationErrors,
]

const analyticsValidation = [
  query("userId").isString().notEmpty().withMessage("User ID is required"),
  query("period").optional().isIn(["week", "month", "year"]).withMessage("Invalid period"),
  handleValidationErrors,
]

// Routes with optional JWT authentication
router.get("/recent", optionalAuth, userIdQueryValidation, getRecentExpenses)
router.get("/analytics", optionalAuth, analyticsValidation, getExpenseAnalytics)
router.get("/:id", optionalAuth, expenseIdValidation, getExpenseById)
router.get("/", optionalAuth, getExpenses)
router.post("/", optionalAuth, createExpenseValidation, createExpense)
router.put("/:id", optionalAuth, updateExpenseValidation, updateExpense)
router.delete("/:id", optionalAuth, expenseIdValidation, deleteExpense)

module.exports = router
