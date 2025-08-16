const mongoose = require("mongoose")

const userChallengeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
      trim: true,
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: [true, "Challenge ID is required"],
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Compound indexes
userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true })
userChallengeSchema.index({ userId: 1, isCompleted: 1 })
userChallengeSchema.index({ userId: 1, completedAt: -1 })

// Pre-save middleware to update lastUpdated
userChallengeSchema.pre("save", function (next) {
  this.lastUpdated = new Date()
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = new Date()
  }
  next()
})

// Static method to get user challenges
userChallengeSchema.statics.getUserChallenges = function (userId, isCompleted = null) {
  const query = { userId }
  if (isCompleted !== null) query.isCompleted = isCompleted
  return this.find(query).populate("challengeId").sort({ lastUpdated: -1 })
}

module.exports = mongoose.model("UserChallenge", userChallengeSchema)
