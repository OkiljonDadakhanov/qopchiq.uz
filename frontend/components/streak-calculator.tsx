"use client"

interface Expense {
  id: string
  amount: number
  category: string
  emoji: string
  description: string
  date: string
  mood?: string
}

interface Meal {
  id: string
  name: string
  calories: number
  emoji: string
  date: string
  category: "protein" | "carbs" | "veggies" | "sweets"
}

export function calculateStreak(expenses: Expense[], meals: Meal[], waterIntake: number): number {
  const today = new Date()
  const activities: { [key: string]: boolean } = {}

  // Check activity for each day going backwards
  let streak = 0
  const currentDate = new Date(today)

  while (true) {
    const dateStr = currentDate.toDateString()

    // Check if there was any activity on this date
    const hasExpense = expenses.some((e) => new Date(e.date).toDateString() === dateStr)
    const hasMeal = meals.some((m) => new Date(m.date).toDateString() === dateStr)

    // For today, also check water intake
    const hasWater =
      currentDate.toDateString() === today.toDateString()
        ? waterIntake > 0
        : localStorage.getItem(`qopchiq-water-${dateStr}`)
          ? Number.parseInt(localStorage.getItem(`qopchiq-water-${dateStr}`) || "0") > 0
          : false

    const hasActivity = hasExpense || hasMeal || hasWater

    if (hasActivity) {
      streak++
    } else {
      // If no activity found and it's not today, break the streak
      if (currentDate.toDateString() !== today.toDateString()) {
        break
      }
    }

    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1)

    // Prevent infinite loop - max 30 days check
    if (streak > 30) break
  }

  return streak
}
