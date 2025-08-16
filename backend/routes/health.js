const express = require("express")
const router = express.Router()
const {
  calculateBMI,
  getBMIHistory,
  getHealthMetrics,
  trackWaterIntake,
  logExercise,
  getExerciseHistory,
} = require("../controllers/healthController")

const { body, param, query } = require("express-validator")
const { handleValidationErrors } = require("../utils/validation")
const { authenticate, optionalAuth } = require("../middleware/auth")

// Validation rules
const bmiValidation = [
  body("userId").isString().notEmpty().withMessage("User ID is required"),
  body("height").isNumeric().isFloat({ min: 50, max: 300 }).withMessage("Height must be between 50 and 300 cm"),
  body("weight").isNumeric().isFloat({ min: 20, max: 500 }).withMessage("Weight must be between 20 and 500 kg"),
  body("age").optional().isNumeric().isInt({ min: 1, max: 150 }).withMessage("Age must be between 1 and 150"),
  body("gender").optional().isIn(["male", "female", "other"]).withMessage("Invalid gender"),
  body("activityLevel")
    .optional()
    .isIn(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"])
    .withMessage("Invalid activity level"),
  body("notes").optional().isString().isLength({ max: 500 }).withMessage("Notes must be less than 500 characters"),
  handleValidationErrors,
]

const waterIntakeValidation = [
  body("userId").isString().notEmpty().withMessage("User ID is required"),
  body("amount").isNumeric().isFloat({ min: 50, max: 2000 }).withMessage("Water amount must be between 50 and 2000 ml"),
  body("notes").optional().isString().isLength({ max: 200 }).withMessage("Notes must be less than 200 characters"),
  handleValidationErrors,
]

const exerciseValidation = [
  body("userId").isString().notEmpty().withMessage("User ID is required"),
  body("name")
    .isString()
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage("Exercise name is required and must be less than 100 characters"),
  body("type").isIn(["cardio", "strength", "flexibility", "sports", "other"]).withMessage("Invalid exercise type"),
  body("duration").isNumeric().isInt({ min: 1, max: 600 }).withMessage("Duration must be between 1 and 600 minutes"),
  body("caloriesBurned")
    .optional()
    .isNumeric()
    .isInt({ min: 1, max: 2000 })
    .withMessage("Calories burned must be between 1 and 2000"),
  body("intensity").optional().isIn(["low", "moderate", "high", "very_high"]).withMessage("Invalid intensity level"),
  body("notes").optional().isString().isLength({ max: 500 }).withMessage("Notes must be less than 500 characters"),
  handleValidationErrors,
]

const userIdParamValidation = [
  param("userId").isString().notEmpty().withMessage("User ID is required"),
  handleValidationErrors,
]

const userIdQueryValidation = [
  query("userId").isString().notEmpty().withMessage("User ID is required"),
  handleValidationErrors,
]

// Routes with optional JWT authentication
router.post("/bmi", optionalAuth, bmiValidation, calculateBMI)
router.get("/bmi/:userId", optionalAuth, userIdParamValidation, getBMIHistory)
router.get("/metrics", optionalAuth, userIdQueryValidation, getHealthMetrics)
router.post("/water", optionalAuth, waterIntakeValidation, trackWaterIntake)
router.post("/exercise", optionalAuth, exerciseValidation, logExercise)
router.get("/exercise", optionalAuth, userIdQueryValidation, getExerciseHistory)

module.exports = router
