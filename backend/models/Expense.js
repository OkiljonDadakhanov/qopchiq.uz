const mongoose = require("mongoose")

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
      max: [10000000, "Amount is too large"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "food",
          "transport",
          "shopping",
          "entertainment",
          "bills",
          "health",
          "education",
          "travel",
          "gifts",
          "other",
        ],
        message: "Invalid category",
      },
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    emoji: {
      type: String,
      default: "💰",
      maxlength: [10, "Emoji field is too long"],
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    mood: {
      type: String,
      enum: {
        values: ["happy", "neutral", "sad", "stressed"],
        message: "Invalid mood",
      },
      default: "neutral",
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    currency: {
      type: String,
      default: "UZS",
      enum: {
        values: ["UZS", "USD", "EUR", "RUB"],
        message: "Invalid currency",
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPeriod: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: function () {
        return this.isRecurring
      },
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "digital_wallet", "other"],
      default: "cash",
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
expenseSchema.index({ userId: 1, date: -1 })
expenseSchema.index({ userId: 1, category: 1 })
expenseSchema.index({ userId: 1, isDeleted: 1 })
expenseSchema.index({ date: -1, category: 1 })

// Virtual for formatted amount
expenseSchema.virtual("formattedAmount").get(function () {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: this.currency,
    minimumFractionDigits: 0,
  }).format(this.amount)
})

// Virtual for day of week
expenseSchema.virtual("dayOfWeek").get(function () {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[this.date.getDay()]
})

// Pre-save middleware to set default emoji based on category
expenseSchema.pre("save", function (next) {
  if (!this.emoji || this.emoji === "💰") {
    const categoryEmojis = {
      food: "🍽️",
      transport: "🚗",
      shopping: "🛍️",
      entertainment: "🎬",
      bills: "📄",
      health: "🏥",
      education: "📚",
      travel: "✈️",
      gifts: "🎁",
      other: "💰",
    }
    this.emoji = categoryEmojis[this.category] || "💰"
  }
  next()
})

// Static method to get expenses by user with filters
expenseSchema.statics.getExpensesByUser = function (userId, filters = {}) {
  const query = { userId, isDeleted: false }

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

  if (filters.minAmount || filters.maxAmount) {
    query.amount = {}
    if (filters.minAmount) {
      query.amount.$gte = filters.minAmount
    }
    if (filters.maxAmount) {
      query.amount.$lte = filters.maxAmount
    }
  }

  return this.find(query).sort({ date: -1 })
}

// Static method to get expense analytics
expenseSchema.statics.getAnalytics = function (userId, period = "month") {
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
        _id: "$category",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
        avgAmount: { $avg: "$amount" },
        maxAmount: { $max: "$amount" },
        minAmount: { $min: "$amount" },
      },
    },
    {
      $sort: { totalAmount: -1 },
    },
  ])
}

module.exports = mongoose.model("Expense", expenseSchema)
