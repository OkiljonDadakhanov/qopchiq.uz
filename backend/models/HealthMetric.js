const mongoose = require("mongoose")

const healthMetricSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
      trim: true,
    },
    height: {
      type: Number,
      required: [true, "Height is required"],
      min: [50, "Height must be at least 50 cm"],
      max: [300, "Height cannot exceed 300 cm"],
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [20, "Weight must be at least 20 kg"],
      max: [500, "Weight cannot exceed 500 kg"],
    },
    age: {
      type: Number,
      min: [1, "Age must be at least 1"],
      max: [150, "Age cannot exceed 150"],
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Invalid gender",
      },
    },
    activityLevel: {
      type: String,
      enum: {
        values: ["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"],
        message: "Invalid activity level",
      },
      default: "moderately_active",
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Compound indexes
healthMetricSchema.index({ userId: 1, date: -1 })
healthMetricSchema.index({ userId: 1, isDeleted: 1 })

// Virtual for BMI calculation
healthMetricSchema.virtual("bmi").get(function () {
  const heightInMeters = this.height / 100
  return Math.round((this.weight / (heightInMeters * heightInMeters)) * 10) / 10
})

// Virtual for BMI category
healthMetricSchema.virtual("bmiCategory").get(function () {
  const bmi = this.bmi
  if (bmi < 18.5) return "underweight"
  if (bmi < 25) return "normal"
  if (bmi < 30) return "overweight"
  return "obese"
})

// Virtual for BMI status
healthMetricSchema.virtual("bmiStatus").get(function () {
  const category = this.bmiCategory
  const statusMap = {
    underweight: { status: "warning", message: "Below normal weight" },
    normal: { status: "healthy", message: "Normal weight" },
    overweight: { status: "warning", message: "Above normal weight" },
    obese: { status: "danger", message: "Significantly above normal weight" },
  }
  return statusMap[category]
})

// Virtual for ideal weight range
healthMetricSchema.virtual("idealWeightRange").get(function () {
  const heightInMeters = this.height / 100
  const minWeight = Math.round(18.5 * heightInMeters * heightInMeters * 10) / 10
  const maxWeight = Math.round(24.9 * heightInMeters * heightInMeters * 10) / 10
  return { min: minWeight, max: maxWeight }
})

// Virtual for daily calorie needs (BMR + activity)
healthMetricSchema.virtual("dailyCalorieNeeds").get(function () {
  if (!this.age || !this.gender) return null

  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr
  if (this.gender === "male") {
    bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age + 5
  } else {
    bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age - 161
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  }

  const multiplier = activityMultipliers[this.activityLevel] || 1.55
  return Math.round(bmr * multiplier)
})

// Static method to get latest health metrics for user
healthMetricSchema.statics.getLatestByUser = function (userId) {
  return this.findOne({ userId, isDeleted: false }).sort({ date: -1 })
}

// Static method to get BMI history
healthMetricSchema.statics.getBMIHistory = function (userId, limit = 10) {
  return this.find({ userId, isDeleted: false }).sort({ date: -1 }).limit(limit).select("weight height bmi date")
}

module.exports = mongoose.model("HealthMetric", healthMetricSchema)
