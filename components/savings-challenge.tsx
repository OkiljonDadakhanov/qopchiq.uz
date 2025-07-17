"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Award, Target } from "lucide-react"

interface Expense {
  id: string
  amount: number
  category: string
  emoji: string
  description: string
  date: string
  mood?: string
}

interface Challenge {
  id: string
  title: string
  description: string
  category: string
  targetReduction: number
  badge: string
  isCompleted: boolean
  progress: number
}

interface SavingsChallengeProps {
  expenses: Expense[]
  language: "uz" | "ru" | "en"
  onBadgeEarned: (badge: string) => void
}

export function SavingsChallenge({ expenses, language, onBadgeEarned }: SavingsChallengeProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "1",
      title: "Fast Food Challenge",
      description: "Spend 10% less on 🍔 Fast food this week",
      category: "food",
      targetReduction: 10,
      badge: "🎖️ Healthy Eater",
      isCompleted: false,
      progress: 0,
    },
    {
      id: "2",
      title: "Transport Saver",
      description: "Reduce 🚗 transport costs by 15%",
      category: "transport",
      targetReduction: 15,
      badge: "🚶‍♂️ Walker",
      isCompleted: false,
      progress: 0,
    },
    {
      id: "3",
      title: "Entertainment Budget",
      description: "Cut 🎮 entertainment spending by 20%",
      category: "entertainment",
      targetReduction: 20,
      badge: "📚 Productive",
      isCompleted: false,
      progress: 0,
    },
  ])

  const texts = {
    uz: {
      title: "Tejash musobaqasi",
      thisWeek: "Bu hafta",
      lastWeek: "O'tgan hafta",
      saved: "tejaldi",
      completed: "Bajarildi",
      inProgress: "Jarayonda",
      earnBadge: "Nishon olish",
    },
    ru: {
      title: "Вызов экономии",
      thisWeek: "На этой неделе",
      lastWeek: "На прошлой неделе",
      saved: "сэкономлено",
      completed: "Завершено",
      inProgress: "В процессе",
      earnBadge: "Получить значок",
    },
    en: {
      title: "Savings Challenge",
      thisWeek: "This week",
      lastWeek: "Last week",
      saved: "saved",
      completed: "Completed",
      inProgress: "In Progress",
      earnBadge: "Earn Badge",
    },
  }

  const t = texts[language]

  useEffect(() => {
    // Calculate progress for each challenge
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const thisWeekExpenses = expenses.filter((e) => new Date(e.date) >= weekAgo)
    const lastWeekExpenses = expenses.filter((e) => new Date(e.date) >= twoWeeksAgo && new Date(e.date) < weekAgo)

    setChallenges((prev) =>
      prev.map((challenge) => {
        const thisWeekSpent = thisWeekExpenses
          .filter((e) => e.category === challenge.category)
          .reduce((sum, e) => sum + e.amount, 0)

        const lastWeekSpent = lastWeekExpenses
          .filter((e) => e.category === challenge.category)
          .reduce((sum, e) => sum + e.amount, 0)

        if (lastWeekSpent === 0) return challenge

        const reduction = ((lastWeekSpent - thisWeekSpent) / lastWeekSpent) * 100
        const progress = Math.min((reduction / challenge.targetReduction) * 100, 100)
        const isCompleted = progress >= 100

        if (isCompleted && !challenge.isCompleted) {
          onBadgeEarned(challenge.badge)
        }

        return {
          ...challenge,
          progress,
          isCompleted,
        }
      }),
    )
  }, [expenses, onBadgeEarned])

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{challenge.description}</div>
              <Badge variant={challenge.isCompleted ? "default" : "secondary"}>
                {challenge.isCompleted ? t.completed : t.inProgress}
              </Badge>
            </div>

            <Progress value={challenge.progress} className="mb-2" />

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {Math.round(challenge.progress)}% / {challenge.targetReduction}%
              </span>
              {challenge.isCompleted && (
                <div className="flex items-center gap-1 text-green-600">
                  <Award className="h-4 w-4" />
                  <span>{challenge.badge}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
