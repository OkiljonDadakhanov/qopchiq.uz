const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    username: {
      type: String,
      trim: true,
      maxlength: [50, "Username cannot exceed 50 characters"],
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    language: {
      type: String,
      enum: {
        values: ["uz", "en"],
        message: "Language must be either uz or en",
      },
      default: "uz",
    },
    monthlyLimit: {
      type: Number,
      default: 1000000,
      min: [0, "Monthly limit cannot be negative"],
      max: [100000000, "Monthly limit is too high"],
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: [1, "Level cannot be less than 1"],
      max: [100, "Level cannot exceed 100"],
    },
    coins: {
      type: Number,
      default: 0,
      min: [0, "Coins cannot be negative"],
    },
    streak: {
      type: Number,
      default: 0,
      min: [0, "Streak cannot be negative"],
    },
    badges: [
      {
        type: String,
        trim: true,
      },
    ],
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      currency: {
        type: String,
        default: "UZS",
        enum: ["UZS", "USD", "EUR", "RUB"],
      },
      theme: {
        type: String,
        default: "light",
        enum: ["light", "dark", "auto"],
      },
      dailyReminder: {
        type: Boolean,
        default: true,
      },
      weeklyReport: {
        type: Boolean,
        default: true,
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ lastActive: -1 });
userSchema.index({ level: -1 });
userSchema.index({ coins: -1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || this.username || "User";
});

// Virtual for experience points (based on level)
userSchema.virtual("experiencePoints").get(function () {
  return (this.level - 1) * 100 + this.coins;
});

// Pre-save middleware to update lastActive
userSchema.pre("save", function (next) {
  if (this.isModified() && !this.isModified("lastActive")) {
    this.lastActive = new Date();
  }
  next();
});

// Static method to find user by telegram ID
userSchema.statics.findByTelegramId = function (telegramId) {
  return this.findOne({ telegramId, isActive: true });
};

// Instance method to add coins
userSchema.methods.addCoins = function (amount) {
  this.coins += amount;
  // Level up logic: every 100 coins = 1 level
  const newLevel = Math.floor(this.coins / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
  }
  return this.save();
};

// Instance method to add badge
userSchema.methods.addBadge = function (badge) {
  if (!this.badges.includes(badge)) {
    this.badges.push(badge);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to update streak
userSchema.methods.updateStreak = function (increment = true) {
  if (increment) {
    this.streak += 1;
  } else {
    this.streak = 0;
  }
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
