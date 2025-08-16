const mongoose = require("mongoose")

const waterIntakeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Water amount is required"],
      min: [50, "Water amount must be at least 50ml"],
      max: [2000, "Water amount cannot exceed 2000ml per entry"],
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, "Notes cannot exceed 200 characters"],
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
waterIntakeSchema.index({ userId: 1, date: -1 })
waterIntakeSchema.index({ userId: 1, isDeleted: 1 })

// Static method to get daily water intake
waterIntakeSchema.statics.getDailyIntake = function (userId, date = new Date()) {
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
        totalAmount: { $sum: "$amount" },
        entryCount: { $sum: 1 },
      },
    },
  ])
}

module.exports = mongoose.model("WaterIntake", waterIntakeSchema)
