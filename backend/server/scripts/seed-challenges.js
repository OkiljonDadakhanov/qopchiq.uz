const mongoose = require("mongoose")
const Challenge = require("../models/Challenge")
require("dotenv").config()

const challenges = [
  // Daily challenges
  {
    name: "Daily Expense Tracker",
    description: "Track at least 3 expenses today",
    icon: "📝",
    type: "daily",
    category: "expense",
    target: 3,
    unit: "count",
    coinsReward: 10,
    badgeReward: null,
  },
  {
    name: "Daily Hydration Goal",
    description: "Drink 2000ml of water today",
    icon: "💧",
    type: "daily",
    category: "health",
    target: 2000,
    unit: "ml",
    coinsReward: 15,
    badgeReward: null,
  },
  {
    name: "Daily Meal Logger",
    description: "Log all 3 main meals today",
    icon: "🍽️",
    type: "daily",
    category: "meal",
    target: 3,
    unit: "count",
    coinsReward: 12,
    badgeReward: null,
  },

  // Weekly challenges
  {
    name: "Weekly Exercise Goal",
    description: "Exercise for 150 minutes this week",
    icon: "💪",
    type: "weekly",
    category: "health",
    target: 150,
    unit: "minutes",
    coinsReward: 50,
    badgeReward: "fitness_enthusiast",
  },
  {
    name: "Weekly Budget Challenge",
    description: "Stay within your weekly budget",
    icon: "💰",
    type: "weekly",
    category: "expense",
    target: 1,
    unit: "count",
    coinsReward: 75,
    badgeReward: "budget_master",
  },
  {
    name: "Weekly Nutrition Balance",
    description: "Log meals from all food categories this week",
    icon: "🥗",
    type: "weekly",
    category: "meal",
    target: 5,
    unit: "count",
    coinsReward: 40,
    badgeReward: null,
  },

  // Monthly challenges
  {
    name: "Monthly Expense Master",
    description: "Track 100 expenses this month",
    icon: "📊",
    type: "monthly",
    category: "expense",
    target: 100,
    unit: "count",
    coinsReward: 200,
    badgeReward: "expense_tracker",
  },
  {
    name: "Monthly Health Champion",
    description: "Complete 20 workout sessions this month",
    icon: "🏆",
    type: "monthly",
    category: "health",
    target: 20,
    unit: "count",
    coinsReward: 300,
    badgeReward: "health_champion",
  },
  {
    name: "Monthly Calorie Counter",
    description: "Track 50,000 calories this month",
    icon: "🔥",
    type: "monthly",
    category: "meal",
    target: 50000,
    unit: "calories",
    coinsReward: 250,
    badgeReward: "calorie_counter",
  },

  // Milestone challenges
  {
    name: "First Week Milestone",
    description: "Use the app for 7 consecutive days",
    icon: "🎯",
    type: "milestone",
    category: "general",
    target: 7,
    unit: "count",
    coinsReward: 100,
    badgeReward: "streak_starter",
  },
  {
    name: "Dedication Milestone",
    description: "Use the app for 30 consecutive days",
    icon: "⚡",
    type: "milestone",
    category: "general",
    target: 30,
    unit: "count",
    coinsReward: 500,
    badgeReward: "streak_master",
  },
]

const seedChallenges = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing challenges
    await Challenge.deleteMany({})
    console.log("Cleared existing challenges")

    // Insert new challenges
    const insertedChallenges = await Challenge.insertMany(challenges)
    console.log(`Inserted ${insertedChallenges.length} challenges`)

    console.log("Challenge seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding challenges:", error)
  } finally {
    await mongoose.connection.close()
    console.log("Database connection closed")
  }
}

// Run the seeding function
seedChallenges()
