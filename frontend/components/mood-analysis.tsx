"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp } from "lucide-react"

interface Expense {
  id: string
  amount: number
  category: string
  emoji: string
  description: string
  date: string
  mood?: string
}

interface MoodAnalysisProps {
  expenses: Expense[]
  language: "uz" | "ru" | "en"
}

export function MoodAnalysis({ expenses, language }: MoodAnalysisProps) {
  const texts = {
    uz: {
      title: "Kayfiyat va xarajat tahlili",
      happy: "Xursand",
      neutral: "Oddiy",
      sad: "G'amgin",
      stressed: "Stress",
      insight: "Ko'rsatkich",
      spendMore: "ko'proq sarflaysiz",
      spendLess: "kamroq sarflaysiz",
      average: "o'rtacha",
    },
    ru: {
      title: "Анализ настроения и расходов",
      happy: "Счастливый",
      neutral: "Нейтральный",
      sad: "Грустный",
      stressed: "Стресс",
      insight: "Понимание",
      spendMore: "тратите больше",
      spendLess: "тратите меньше",
      average: "в среднем",
    },
    en: {
      title: "Mood vs Expense Analysis",
      happy: "Happy",
      neutral: "Neutral",
      sad: "Sad",
      stressed: "Stressed",
      insight: "Insight",
      spendMore: "spend more",
      spendLess: "spend less",
      average: "average",
    },
  }

  const t = texts[language]

  // Calculate spending by mood
  const moodSpending = {
    happy: expenses.filter((e) => e.mood === "happy").reduce((sum, e) => sum + e.amount, 0),
    neutral: expenses.filter((e) => e.mood === "neutral").reduce((sum, e) => sum + e.amount, 0),
    sad: expenses.filter((e) => e.mood === "sad").reduce((sum, e) => sum + e.amount, 0),
    stressed: expenses.filter((e) => e.mood === "stressed").reduce((sum, e) => sum + e.amount, 0),
  }

  const moodCounts = {
    happy: expenses.filter((e) => e.mood === "happy").length,
    neutral: expenses.filter((e) => e.mood === "neutral").length,
    sad: expenses.filter((e) => e.mood === "sad").length,
    stressed: expenses.filter((e) => e.mood === "stressed").length,
  }

  const moodAverages = {
    happy: moodCounts.happy > 0 ? moodSpending.happy / moodCounts.happy : 0,
    neutral: moodCounts.neutral > 0 ? moodSpending.neutral / moodCounts.neutral : 0,
    sad: moodCounts.sad > 0 ? moodSpending.sad / moodCounts.sad : 0,
    stressed: moodCounts.stressed > 0 ? moodSpending.stressed / moodCounts.stressed : 0,
  }

  const totalExpenses = Object.values(moodSpending).reduce((sum, amount) => sum + amount, 0)
  const totalCount = Object.values(moodCounts).reduce((sum, count) => sum + count, 0)

  if (totalCount === 0) {
    return null
  }

  const highestSpendingMood = Object.entries(moodAverages).reduce((a, b) =>
    moodAverages[a[0] as keyof typeof moodAverages] > moodAverages[b[0] as keyof typeof moodAverages] ? a : b,
  )[0] as keyof typeof moodAverages

  const moodEmojis = {
    happy: "😊",
    neutral: "😐",
    sad: "😔",
    stressed: "😤",
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(moodAverages).map(([mood, average]) => {
          const percentage =
            totalExpenses > 0 ? (moodSpending[mood as keyof typeof moodSpending] / totalExpenses) * 100 : 0

          return (
            <div key={mood} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {moodEmojis[mood as keyof typeof moodEmojis]} {t[mood as keyof typeof t]}
                </span>
                <span className="text-sm font-medium">
                  {average.toLocaleString()} so'm {t.average}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              <div className="text-xs text-gray-500">
                {moodCounts[mood as keyof typeof moodCounts]} marta, {percentage.toFixed(1)}%
              </div>
            </div>
          )
        })}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <span>💡</span>
            <span className="font-medium">{t.insight}</span>
          </div>
          <p className="text-sm text-blue-600">
            {moodEmojis[highestSpendingMood]} {t[highestSpendingMood]} bo'lganingizda {t.spendMore}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
