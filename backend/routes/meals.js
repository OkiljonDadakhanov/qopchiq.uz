const express = require("express")
const router = express.Router()
const {
  getMeals,
  createMeal,
  updateMeal,
  deleteMeal,
  getMealAnalytics,
  getMealById,
  getDailyCalories,
  getRecentMeals,
} = require("../controllers/mealController")

const { body, param, query } = require("express-validator")
const { handleValidationErrors } = require("../utils/validation")
const { authenticate, optionalAuth } = require("../middleware/auth")

// Validation rules
const createMealValidation = [
  body("userId").isString().notEmpty().withMessage("User ID is required"),
  body("name")
    .isString()
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage("Meal name is required and must be less than 100 characters"),
  body("calories").isNumeric().isFloat({ min: 1, max: 5000 }).withMessage("Calories must be between 1 and 5000"),
  body("category").isIn(["protein", "carbs", "veggies", "sweets", "other"]).withMessage("Invalid category"),
  body("mealType").isIn(["breakfast", "lunch", "dinner", "snack"]).withMessage("Invalid meal type"),
  body("emoji").optional().isString().isLength({ max: 10 }).withMessage("Emoji field is too long"),
  body("date").optional().isISO8601().withMessage("Date must be in ISO format"),
  body("notes").optional().isString().isLength({ max: 500 }).withMessage("Notes must be less than 500 characters"),
  body("ingredients").optional().isArray().withMessage("Ingredients must be an array"),
  body("ingredients.*.name")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Ingredient name must be less than 50 characters"),
  body("ingredients.*.quantity")
    .optional()
    .isNumeric()
    .isFloat({ min: 0.1 })
    .withMessage("Ingredient quantity must be at least 0.1"),
  body("ingredients.*.unit")
    .optional()
    .isIn(["g", "kg", "ml", "l", "cup", "tbsp", "tsp", "piece", "slice"])
    .withMessage("Invalid ingredient unit"),
  body("nutritionInfo.protein").optional().isNumeric().isFloat({ min: 0 }).withMessage("Protein must be non-negative"),
  body("nutritionInfo.carbs").optional().isNumeric().isFloat({ min: 0 }).withMessage("Carbs must be non-negative"),
  body("nutritionInfo.fat").optional().isNumeric().isFloat({ min: 0 }).withMessage("Fat must be non-negative"),
  body("rating").optional().isNumeric().isFloat({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("isHomemade").optional().isBoolean().withMessage("isHomemade must be a boolean"),
  body("restaurant")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Restaurant name must be less than 100 characters"),
  body("cost").optional().isNumeric().isFloat({ min: 0 }).withMessage("Cost must be non-negative"),
  handleValidationErrors,
]

const updateMealValidation = [
  param("id").isMongoId().withMessage("Invalid meal ID"),
  body("name").optional().isString().isLength({ max: 100 }).withMessage("Meal name must be less than 100 characters"),
  body("calories")
    .optional()
    .isNumeric()
    .isFloat({ min: 1, max: 5000 })
    .withMessage("Calories must be between 1 and 5000"),
  body("category").optional().isIn(["protein", "carbs", "veggies", "sweets", "other"]).withMessage("Invalid category"),
  body("mealType").optional().isIn(["breakfast", "lunch", "dinner", "snack"]).withMessage("Invalid meal type"),
  body("emoji").optional().isString().isLength({ max: 10 }).withMessage("Emoji field is too long"),
  body("date").optional().isISO8601().withMessage("Date must be in ISO format"),
  body("notes").optional().isString().isLength({ max: 500 }).withMessage("Notes must be less than 500 characters"),
  body("rating").optional().isNumeric().isFloat({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("isHomemade").optional().isBoolean().withMessage("isHomemade must be a boolean"),
  body("restaurant")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Restaurant name must be less than 100 characters"),
  body("cost").optional().isNumeric().isFloat({ min: 0 }).withMessage("Cost must be non-negative"),
  handleValidationErrors,
]

const mealIdValidation = [param("id").isMongoId().withMessage("Invalid meal ID"), handleValidationErrors]

const userIdQueryValidation = [
  query("userId").isString().notEmpty().withMessage("User ID is required"),
  handleValidationErrors,
]

const analyticsValidation = [
  query("userId").isString().notEmpty().withMessage("User ID is required"),
  query("period").optional().isIn(["week", "month", "year"]).withMessage("Invalid period"),
  handleValidationErrors,
]

const dailyCaloriesValidation = [
  query("userId").isString().notEmpty().withMessage("User ID is required"),
  query("date").optional().isISO8601().withMessage("Date must be in ISO format"),
  handleValidationErrors,
]

// Routes with optional JWT authentication
router.get("/recent", optionalAuth, userIdQueryValidation, getRecentMeals)
router.get("/daily-calories", optionalAuth, dailyCaloriesValidation, getDailyCalories)
router.get("/analytics", optionalAuth, analyticsValidation, getMealAnalytics)
router.get("/:id", optionalAuth, mealIdValidation, getMealById)
router.get("/", optionalAuth, getMeals)
router.post("/", optionalAuth, createMealValidation, createMeal)
router.put("/:id", optionalAuth, updateMealValidation, updateMeal)
router.delete("/:id", optionalAuth, mealIdValidation, deleteMeal)

module.exports = router
