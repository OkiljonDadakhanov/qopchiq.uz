const mongoose = require("mongoose")

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
      trim: true,
    },
    badgeId: {
      type: String,
      required: [true, "Badge ID is required"],
      index: true,
    },
    badgeName: {
      type: String,
      required: [true, "Badge name is required"],
      trim: true,
    },
    badgeDescription: {
      type: String,
      required: [true, "Badge description is required"],
      trim: true,
    },
    badgeIcon: {
      type: String,
      default: "🏆",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["expense", "meal", "health", "streak", "milestone", "special"],
        message: "Invalid achievement category",
      },
      index: true,
    },
    rarity: {
      type: String,
      enum: {
        values: ["common", "rare", "epic", "legendary"],
        message: "Invalid rarity level",
      },
      default: "common",
    },
    coinsRewarded: {
      type: Number,
      default: 0,
      min: [0, "Coins rewarded cannot be negative"],
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    progress: {
      current: {
        type: Number,
        default: 0,
      },
      target: {
        type: Number,
        default: 1,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
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
achievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true })
achievementSchema.index({ userId: 1, category: 1 })
achievementSchema.index({ userId: 1, unlockedAt: -1 })

// Static method to get user achievements
achievementSchema.statics.getUserAchievements = function (userId, category = null) {
  const query = { userId, isDeleted: false }
  if (category) query.category = category
  return this.find(query).sort({ unlockedAt: -1 })
}

module.exports = mongoose.model("Achievement", achievementSchema)
