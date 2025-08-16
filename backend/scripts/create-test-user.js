require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const createTestUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "demo@qopchiq.uz" });
    if (existingUser) {
      console.log("Test user already exists:", existingUser._id);
      return existingUser._id;
    }

    // Create test user
    const testUser = await User.create({
      email: "demo@qopchiq.uz",
      username: "demo_user",
      firstName: "Demo",
      lastName: "User",
      language: "uz",
      monthlyLimit: 1000000,
      currentBalance: 500000,
      level: 5,
      coins: 150,
      streak: 7,
      badges: ["first_expense", "savings_master"],
      preferences: {
        notifications: true,
        currency: "UZS",
        theme: "light",
        dailyReminder: true,
        weeklyReport: true,
      },
    });

    console.log("Test user created successfully:", testUser._id);
    return testUser._id;
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUser();
