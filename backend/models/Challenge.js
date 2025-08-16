const mongoose = require("mongoose")

const challengeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Challenge name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Challenge description is required"],
      trim: true,
    },
    icon: {
      type: String,
      default: "🎯",
    },
    type: {
      type: String,
      required: [true, "Challenge type is required"],
      enum: {
        values: ["daily", "weekly", "monthly", "milestone"],
        message: "Invalid challenge type",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["expense", "meal", "health", "general"],
        message: "Invalid challenge category",
      },
    },
    target: {
      type: Number,
      required: [true, "Target is required"],
      min: [1, "Target must be at least 1"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: ["count", "amount", "calories", "minutes", "ml"],
    },
    coinsReward: {
      type: Number,
      required: [true, "Coins reward is required"],
      min: [1, "Coins reward must be at least 1"],
    },
    badgeReward: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
challengeSchema.index({ type: 1, isActive: 1 })
challengeSchema.index({ category: 1, isActive: 1 })
challengeSchema.index({ startDate: 1, endDate: 1 })

// Static method to get active challenges
challengeSchema.statics.getActiveChallenges = function (type = null) {
  const query = { isActive: true }
  const now = new Date()

  // Check if challenge is within date range
  query.$or = [{ endDate: { $exists: false } }, { endDate: { $gte: now } }]
  query.startDate = { $lte: now }

  if (type) query.type = type

  return this.find(query).sort({ createdAt: -1 })
}

module.exports = mongoose.model("Challenge", challengeSchema)
