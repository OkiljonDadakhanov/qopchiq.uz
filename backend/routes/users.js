const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  addCoins,
  addBadge,
  updateStreak,
} = require("../controllers/userController");

const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../utils/validation");

// Validation rules
const createUserValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("username")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Username must be less than 50 characters"),
  body("firstName")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("First name must be less than 50 characters"),
  body("lastName")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters"),
  body("language")
    .optional()
    .isIn(["uz", "en"])
    .withMessage("Language must be either uz or en"),
  body("monthlyLimit")
    .optional()
    .isNumeric()
    .isFloat({ min: 0, max: 100000000 })
    .withMessage("Monthly limit must be between 0 and 100,000,000"),
  handleValidationErrors,
];

const updateUserValidation = [
  param("userId").isMongoId().withMessage("Valid user ID required"),
  body("username")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Username must be less than 50 characters"),
  body("firstName")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("First name must be less than 50 characters"),
  body("lastName")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters"),
  body("language")
    .optional()
    .isIn(["uz", "en"])
    .withMessage("Language must be either uz or en"),
  body("monthlyLimit")
    .optional()
    .isNumeric()
    .isFloat({ min: 0, max: 100000000 })
    .withMessage("Monthly limit must be between 0 and 100,000,000"),
  handleValidationErrors,
];

const userIdValidation = [
  param("userId").isMongoId().withMessage("Valid user ID required"),
  handleValidationErrors,
];

const addCoinsValidation = [
  param("userId").isMongoId().withMessage("Valid user ID required"),
  body("amount")
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage("Amount must be a positive number"),
  body("reason").optional().isString().withMessage("Reason must be a string"),
  handleValidationErrors,
];

const addBadgeValidation = [
  param("userId").isMongoId().withMessage("Valid user ID required"),
  body("badge").isString().notEmpty().withMessage("Badge name is required"),
  handleValidationErrors,
];

const updateStreakValidation = [
  param("userId").isMongoId().withMessage("Valid user ID required"),
  body("increment")
    .optional()
    .isBoolean()
    .withMessage("Increment must be a boolean"),
  handleValidationErrors,
];

// Routes
router.get("/", getUsers);
router.get("/:userId", userIdValidation, getUserById);
router.post("/", createUserValidation, createUser);
router.put("/:userId", updateUserValidation, updateUser);
router.delete("/:userId", userIdValidation, deleteUser);

// Additional user endpoints
router.get("/:userId/stats", userIdValidation, getUserStats);
router.post("/:userId/coins", addCoinsValidation, addCoins);
router.post("/:userId/badges", addBadgeValidation, addBadge);
router.post("/:userId/streak", updateStreakValidation, updateStreak);

module.exports = router;
