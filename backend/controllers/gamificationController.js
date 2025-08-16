const User = require("../models/User")
const Achievement = require("../models/Achievement")
const Challenge = require("../models/Challenge")
const UserChallenge = require("../models/UserChallenge")
const asyncHandler = require("../utils/asyncHandler")
const { sendResponse, sendError } = require("../utils/apiResponse")

// @desc    Award coins to user
// @route   POST /api/gamification/earn-coins
// @access  Public
const earnCoins = asyncHandler(async (req, res) => {
  const { userId, amount, reason, category } = req.body

  const user = await User.findByTelegramId(userId)
  if (!user) {
    return sendError(res, 404, "User not found")
  }

  const oldLevel = user.level
  await user.addCoins(amount)

  // Check for level-up achievements
  if (user.level > oldLevel) {
    await checkLevelUpAchievements(userId, user.level)
  }

  // Update challenge progress if applicable
  if (category) {
    await updateChallengeProgress(userId, category, amount)
  }

  sendResponse(res, 200, {
    user,
    coinsEarned: amount,
    reason,
    leveledUp: user.level > oldLevel,
    newLevel: user.level,
  })
})

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
  const { type = "coins", limit = 10, period = "all" } = req.query

  let sortField = "coins"
  const matchQuery = { isActive: true }

  // Determine sort field based on type
  switch (type) {
    case "level":
      sortField = "level"
      break
    case "streak":
      sortField = "streak"
      break
    case "coins":
    default:
      sortField = "coins"
  }

  // Add period filter if needed
  if (period !== "all") {
    const now = new Date()
    let startDate

    switch (period) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = null
    }

    if (startDate) {
      matchQuery.lastActive = { $gte: startDate }
    }
  }

  const leaderboard = await User.find(matchQuery)
    .select("telegramId username firstName lastName level coins streak lastActive")
    .sort({ [sortField]: -1, lastActive: -1 })
    .limit(Number.parseInt(limit))

  // Add rank to each user
  const rankedLeaderboard = leaderboard.map((user, index) => ({
    ...user.toObject(),
    rank: index + 1,
  }))

  sendResponse(res, 200, {
    leaderboard: rankedLeaderboard,
    type,
    period,
    totalUsers: rankedLeaderboard.length,
  })
})

// @desc    Handle level progression
// @route   POST /api/gamification/level-up
// @access  Public
const levelUp = asyncHandler(async (req, res) => {
  const { userId } = req.body

  const user = await User.findByTelegramId(userId)
  if (!user) {
    return sendError(res, 404, "User not found")
  }

  // Calculate new level based on coins
  const newLevel = Math.floor(user.coins / 100) + 1

  if (newLevel > user.level) {
    const oldLevel = user.level
    user.level = newLevel
    await user.save()

    // Award level-up achievements
    await checkLevelUpAchievements(userId, newLevel)

    sendResponse(res, 200, {
      user,
      oldLevel,
      newLevel,
      leveledUp: true,
    })
  } else {
    sendResponse(res, 200, {
      user,
      leveledUp: false,
      message: "No level up available",
    })
  }
})

// @desc    Get available badges
// @route   GET /api/gamification/badges
// @access  Public
const getBadges = asyncHandler(async (req, res) => {
  const { userId, category } = req.query

  if (!userId) {
    return sendError(res, 400, "User ID is required")
  }

  // Get user's achievements
  const userAchievements = await Achievement.getUserAchievements(userId, category)

  // Get all available badges (predefined)
  const allBadges = getAllAvailableBadges()

  // Filter badges by category if specified
  const filteredBadges = category ? allBadges.filter((badge) => badge.category === category) : allBadges

  // Mark which badges the user has earned
  const badgesWithStatus = filteredBadges.map((badge) => {
    const userBadge = userAchievements.find((achievement) => achievement.badgeId === badge.id)
    return {
      ...badge,
      isEarned: !!userBadge,
      earnedAt: userBadge?.unlockedAt || null,
      progress: userBadge?.progress || { current: 0, target: badge.target || 1, isCompleted: false },
    }
  })

  sendResponse(res, 200, {
    badges: badgesWithStatus,
    totalBadges: filteredBadges.length,
    earnedBadges: userAchievements.length,
  })
})

// @desc    Get user challenges
// @route   GET /api/gamification/challenges
// @access  Public
const getUserChallenges = asyncHandler(async (req, res) => {
  const { userId, status = "all" } = req.query

  if (!userId) {
    return sendError(res, 400, "User ID is required")
  }

  let isCompleted = null
  if (status === "completed") isCompleted = true
  else if (status === "active") isCompleted = false

  const userChallenges = await UserChallenge.getUserChallenges(userId, isCompleted)

  // Get available challenges that user hasn't started
  const activeChallenges = await Challenge.getActiveChallenges()
  const userChallengeIds = userChallenges.map((uc) => uc.challengeId._id.toString())
  const availableChallenges = activeChallenges.filter(
    (challenge) => !userChallengeIds.includes(challenge._id.toString()),
  )

  sendResponse(res, 200, {
    userChallenges,
    availableChallenges,
    summary: {
      total: userChallenges.length,
      completed: userChallenges.filter((uc) => uc.isCompleted).length,
      active: userChallenges.filter((uc) => !uc.isCompleted).length,
      available: availableChallenges.length,
    },
  })
})

// @desc    Join a challenge
// @route   POST /api/gamification/challenges/join
// @access  Public
const joinChallenge = asyncHandler(async (req, res) => {
  const { userId, challengeId } = req.body

  const user = await User.findByTelegramId(userId)
  if (!user) {
    return sendError(res, 404, "User not found")
  }

  const challenge = await Challenge.findById(challengeId)
  if (!challenge || !challenge.isActive) {
    return sendError(res, 404, "Challenge not found or inactive")
  }

  // Check if user already joined this challenge
  const existingUserChallenge = await UserChallenge.findOne({ userId, challengeId })
  if (existingUserChallenge) {
    return sendError(res, 400, "User already joined this challenge")
  }

  const userChallenge = await UserChallenge.create({
    userId,
    challengeId,
  })

  await userChallenge.populate("challengeId")

  sendResponse(res, 201, { userChallenge }, "Successfully joined challenge")
})

// @desc    Update challenge progress
// @route   POST /api/gamification/challenges/progress
// @access  Public
const updateChallengeProgressEndpoint = asyncHandler(async (req, res) => {
  const { userId, challengeId, progress } = req.body

  const userChallenge = await UserChallenge.findOne({ userId, challengeId }).populate("challengeId")
  if (!userChallenge) {
    return sendError(res, 404, "User challenge not found")
  }

  if (userChallenge.isCompleted) {
    return sendError(res, 400, "Challenge already completed")
  }

  userChallenge.progress = Math.min(progress, userChallenge.challengeId.target)

  // Check if challenge is completed
  if (userChallenge.progress >= userChallenge.challengeId.target) {
    userChallenge.isCompleted = true
    userChallenge.completedAt = new Date()

    // Award coins and badge
    const user = await User.findByTelegramId(userId)
    if (user) {
      await user.addCoins(userChallenge.challengeId.coinsReward)

      if (userChallenge.challengeId.badgeReward) {
        await user.addBadge(userChallenge.challengeId.badgeReward)
      }
    }
  }

  await userChallenge.save()

  sendResponse(res, 200, {
    userChallenge,
    completed: userChallenge.isCompleted,
  })
})

// Helper function to check level-up achievements
const checkLevelUpAchievements = async (userId, level) => {
  const levelMilestones = [5, 10, 25, 50, 100]

  for (const milestone of levelMilestones) {
    if (level >= milestone) {
      const badgeId = `level_${milestone}`
      const existingAchievement = await Achievement.findOne({ userId, badgeId })

      if (!existingAchievement) {
        await Achievement.create({
          userId,
          badgeId,
          badgeName: `Level ${milestone} Master`,
          badgeDescription: `Reached level ${milestone}`,
          badgeIcon: "🏆",
          category: "milestone",
          rarity: milestone >= 50 ? "legendary" : milestone >= 25 ? "epic" : "rare",
          coinsRewarded: milestone * 10,
          progress: { current: level, target: milestone, isCompleted: true },
        })
      }
    }
  }
}

// Helper function to update challenge progress
const updateChallengeProgress = async (userId, category, amount) => {
  const userChallenges = await UserChallenge.find({
    userId,
    isCompleted: false,
  }).populate("challengeId")

  for (const userChallenge of userChallenges) {
    if (userChallenge.challengeId.category === category) {
      userChallenge.progress += amount
      if (userChallenge.progress >= userChallenge.challengeId.target) {
        userChallenge.isCompleted = true
        userChallenge.completedAt = new Date()

        // Award rewards
        const user = await User.findByTelegramId(userId)
        if (user) {
          await user.addCoins(userChallenge.challengeId.coinsReward)
          if (userChallenge.challengeId.badgeReward) {
            await user.addBadge(userChallenge.challengeId.badgeReward)
          }
        }
      }
      await userChallenge.save()
    }
  }
}

// Helper function to get all available badges
const getAllAvailableBadges = () => {
  return [
    // Expense badges
    {
      id: "first_expense",
      name: "First Step",
      description: "Track your first expense",
      icon: "🎯",
      category: "expense",
      rarity: "common",
      target: 1,
    },
    {
      id: "expense_tracker",
      name: "Expense Tracker",
      description: "Track 50 expenses",
      icon: "📊",
      category: "expense",
      rarity: "rare",
      target: 50,
    },
    {
      id: "budget_master",
      name: "Budget Master",
      description: "Stay within budget for a month",
      icon: "💰",
      category: "expense",
      rarity: "epic",
      target: 1,
    },

    // Meal badges
    {
      id: "first_meal",
      name: "Nutrition Starter",
      description: "Log your first meal",
      icon: "🍽️",
      category: "meal",
      rarity: "common",
      target: 1,
    },
    {
      id: "healthy_eater",
      name: "Healthy Eater",
      description: "Log 100 meals",
      icon: "🥗",
      category: "meal",
      rarity: "rare",
      target: 100,
    },
    {
      id: "calorie_counter",
      name: "Calorie Counter",
      description: "Track 10,000 calories",
      icon: "🔥",
      category: "meal",
      rarity: "epic",
      target: 10000,
    },

    // Health badges
    {
      id: "health_conscious",
      name: "Health Conscious",
      description: "Calculate your first BMI",
      icon: "⚖️",
      category: "health",
      rarity: "common",
      target: 1,
    },
    {
      id: "hydration_hero",
      name: "Hydration Hero",
      description: "Drink 2L of water daily for 7 days",
      icon: "💧",
      category: "health",
      rarity: "rare",
      target: 7,
    },
    {
      id: "fitness_enthusiast",
      name: "Fitness Enthusiast",
      description: "Exercise for 150 minutes in a week",
      icon: "💪",
      category: "health",
      rarity: "epic",
      target: 150,
    },

    // Streak badges
    {
      id: "streak_starter",
      name: "Streak Starter",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      category: "streak",
      rarity: "common",
      target: 7,
    },
    {
      id: "streak_master",
      name: "Streak Master",
      description: "Maintain a 30-day streak",
      icon: "⚡",
      category: "streak",
      rarity: "epic",
      target: 30,
    },
    {
      id: "streak_legend",
      name: "Streak Legend",
      description: "Maintain a 100-day streak",
      icon: "👑",
      category: "streak",
      rarity: "legendary",
      target: 100,
    },
  ]
}

module.exports = {
  earnCoins,
  getLeaderboard,
  levelUp,
  getBadges,
  getUserChallenges,
  joinChallenge,
  updateChallengeProgressEndpoint,
}
