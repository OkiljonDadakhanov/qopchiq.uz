const mongoose = require("mongoose")

const exerciseSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Exercise name is required"],
      trim: true,
      maxlength: [100, "Exercise name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      required: [true, "Exercise type is required"],
      enum: {
        values: ["cardio", "strength", "flexibility", "sports", "other"],
        message: "Invalid exercise type",
      },
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      max: [600, "Duration cannot exceed 600 minutes"],
    },
    caloriesBurned: {
      type: Number,
      min: [1, "Calories burned must be at least 1"],
      max: [2000, "Calories burned cannot exceed 2000 per session"],
    },
    intensity: {
      type: String,
      enum: {
        values: ["low", "moderate", "high", "very_high"],
        message: "Invalid intensity level",
      },
      default: "moderate",
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Compound indexes
exerciseSchema.index({ userId: 1, date: -1 })
exerciseSchema.index({ userId: 1, type: 1 })
exerciseSchema.index({ userId: 1, isDeleted: 1 })

// Pre-save middleware to estimate calories if not provided
exerciseSchema.pre("save", function (next) {
  if (!this.caloriesBurned) {
    // Rough calorie estimation based on type and duration
    const calorieRates = {
      cardio: { low: 5, moderate: 8, high: 12, very_high: 15 },
      strength: { low: 3, moderate: 5, high: 7, very_high: 9 },
      flexibility: { low: 2, moderate: 3, high: 4, very_high: 5 },
      sports: { low: 6, moderate: 9, high: 13, very_high: 16 },
      other: { low: 4, moderate: 6, high: 8, very_high: 10 },
    }

    const rate = calorieRates[this.type]?.[this.intensity] || 6
    this.caloriesBurned = Math.round(this.duration * rate)
  }
  next()
})

// Static method to get weekly exercise summary
exerciseSchema.statics.getWeeklySummary = function (userId, startDate = new Date()) {
  const weekStart = new Date(startDate)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return this.aggregate([
    {
      $match: {
        userId,
        isDeleted: false,
        date: { $gte: weekStart, $lte: weekEnd },
      },
    },
    {
      $group: {
        _id: "$type",
        totalDuration: { $sum: "$duration" },
        totalCalories: { $sum: "$caloriesBurned" },
        sessionCount: { $sum: 1 },
      },
    },
  ])
}

module.exports = mongoose.model("Exercise", exerciseSchema)
