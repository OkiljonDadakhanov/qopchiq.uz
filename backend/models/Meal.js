const mongoose = require("mongoose")

const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Meal name is required"],
      trim: true,
      maxlength: [100, "Meal name cannot exceed 100 characters"],
    },
    calories: {
      type: Number,
      required: [true, "Calories are required"],
      min: [1, "Calories must be at least 1"],
      max: [5000, "Calories cannot exceed 5000 per meal"],
    },
    emoji: {
      type: String,
      default: "🍽️",
      maxlength: [10, "Emoji field is too long"],
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["protein", "carbs", "veggies", "sweets", "other"],
        message: "Invalid category",
      },
      index: true,
    },
    mealType: {
      type: String,
      required: [true, "Meal type is required"],
      enum: {
        values: ["breakfast", "lunch", "dinner", "snack"],
        message: "Invalid meal type",
      },
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    ingredients: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: [50, "Ingredient name cannot exceed 50 characters"],
        },
        quantity: {
          type: Number,
          required: true,
          min: [0.1, "Quantity must be at least 0.1"],
        },
        unit: {
          type: String,
          required: true,
          enum: ["g", "kg", "ml", "l", "cup", "tbsp", "tsp", "piece", "slice"],
        },
        calories: {
          type: Number,
          min: [0, "Calories cannot be negative"],
        },
      },
    ],
    nutritionInfo: {
      protein: {
        type: Number,
        min: [0, "Protein cannot be negative"],
        default: 0,
      },
      carbs: {
        type: Number,
        min: [0, "Carbs cannot be negative"],
        default: 0,
      },
      fat: {
        type: Number,
        min: [0, "Fat cannot be negative"],
        default: 0,
      },
      fiber: {
        type: Number,
        min: [0, "Fiber cannot be negative"],
        default: 0,
      },
      sugar: {
        type: Number,
        min: [0, "Sugar cannot be negative"],
        default: 0,
      },
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    isHomemade: {
      type: Boolean,
      default: true,
    },
    restaurant: {
      type: String,
      trim: true,
      maxlength: [100, "Restaurant name cannot exceed 100 characters"],
    },
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Compound indexes for better query performance
mealSchema.index({ userId: 1, date: -1 })
mealSchema.index({ userId: 1, mealType: 1 })
mealSchema.index({ userId: 1, category: 1 })
mealSchema.index({ userId: 1, isDeleted: 1 })
mealSchema.index({ date: -1, mealType: 1 })

// Virtual for calories per gram of protein
mealSchema.virtual("proteinCalories").get(function () {
  return this.nutritionInfo.protein * 4 // 4 calories per gram of protein
})

// Virtual for calories per gram of carbs
mealSchema.virtual("carbCalories").get(function () {
  return this.nutritionInfo.carbs * 4 // 4 calories per gram of carbs
})

// Virtual for calories per gram of fat
mealSchema.virtual("fatCalories").get(function () {
  return this.nutritionInfo.fat * 9 // 9 calories per gram of fat
})

// Virtual for macronutrient percentages
mealSchema.virtual("macroPercentages").get(function () {
  const totalCalories = this.calories
  if (totalCalories === 0) return { protein: 0, carbs: 0, fat: 0 }

  return {
    protein: Math.round((this.proteinCalories / totalCalories) * 100),
    carbs: Math.round((this.carbCalories / totalCalories) * 100),
    fat: Math.round((this.fatCalories / totalCalories) * 100),
  }
})

// Virtual for total ingredients calories
mealSchema.virtual("ingredientsCalories").get(function () {
  return this.ingredients.reduce((total, ingredient) => total + (ingredient.calories || 0), 0)
})

// Pre-save middleware to set default emoji based on category
mealSchema.pre("save", function (next) {
  if (!this.emoji || this.emoji === "🍽️") {
    const categoryEmojis = {
      protein: "🥩",
      carbs: "🍞",
      veggies: "🥗",
      sweets: "🍰",
      other: "🍽️",
    }
    this.emoji = categoryEmojis[this.category] || "🍽️"
  }

  // Set meal type emoji if not set
  if (this.emoji === "🍽️") {
    const mealTypeEmojis = {
      breakfast: "🌅",
      lunch: "☀️",
      dinner: "🌙",
      snack: "🍪",
    }
    this.emoji = mealTypeEmojis[this.mealType] || "🍽️"
  }

  next()
})

// Static method to get meals by user with filters
mealSchema.statics.getMealsByUser = function (userId, filters = {}) {
  const query = { userId, isDeleted: false }

  if (filters.mealType) {
    query.mealType = filters.mealType
  }

  if (filters.category) {
    query.category = filters.category
  }

  if (filters.startDate || filters.endDate) {
    query.date = {}
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate)
    }
    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate)
    }
  }

  return this.find(query).sort({ date: -1 })
}

// Static method to get meal analytics
mealSchema.statics.getAnalytics = function (userId, period = "month") {
  const now = new Date()
  let startDate

  switch (period) {
    case "week":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
      break
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return this.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$mealType",
        totalCalories: { $sum: "$calories" },
        count: { $sum: 1 },
        avgCalories: { $avg: "$calories" },
        avgProtein: { $avg: "$nutritionInfo.protein" },
        avgCarbs: { $avg: "$nutritionInfo.carbs" },
        avgFat: { $avg: "$nutritionInfo.fat" },
      },
    },
    {
      $sort: { totalCalories: -1 },
    },
  ])
}

// Static method to get daily calorie intake
mealSchema.statics.getDailyCalories = function (userId, date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return this.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: null,
        totalCalories: { $sum: "$calories" },
        totalProtein: { $sum: "$nutritionInfo.protein" },
        totalCarbs: { $sum: "$nutritionInfo.carbs" },
        totalFat: { $sum: "$nutritionInfo.fat" },
        mealCount: { $sum: 1 },
      },
    },
  ])
}

module.exports = mongoose.model("Meal", mealSchema)
