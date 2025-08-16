const { body, param, query, validationResult } = require("express-validator")

// Validation middleware to check for errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// Common validation rules
const validationRules = {
  telegramId: body("telegramId").isString().notEmpty().withMessage("Telegram ID is required"),

  amount: body("amount").isNumeric().isFloat({ min: 0 }).withMessage("Amount must be a positive number"),

  category: body("category").isString().notEmpty().withMessage("Category is required"),

  date: body("date").optional().isISO8601().withMessage("Date must be in ISO format"),

  language: body("language").optional().isIn(["uz", "en"]).withMessage("Language must be either uz or en"),

  objectId: param("id").isMongoId().withMessage("Invalid ID format"),
}

module.exports = {
  handleValidationErrors,
  validationRules,
  body,
  param,
  query,
}
