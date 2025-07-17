"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Meal {
  id: string
  name: string
  calories: number
  emoji: string
  date: string
  category: "protein" | "carbs" | "veggies" | "sweets"
}

interface HealthStatsProps {
  meals: Meal[]
  language: "uz" | "ru" | "en"
}

export function HealthStats({ meals, language }: HealthStatsProps) {
  const texts = {
    uz: {
      title: "Sog'liq statistikasi",
      protein: "Oqsil",
      carbs: "Uglevod",
      veggies: "Sabzavot",
      sweets: "Shirinlik",
      balanced: "Muvozanatli",
      needsWork: "Yaxshilash kerak",
    },
    ru: {
      title: "Статистика здоровья",
      protein: "Белки",
      carbs: "Углеводы",
      veggies: "Овощи",
      sweets: "Сладости",
      balanced: "Сбалансированно",
      needsWork: "Нужно улучшить",
    },
    en: {
      title: "Health Stats",
      protein: "Protein",
      carbs: "Carbs",
      veggies: "Veggies",
      sweets: "Sweets",
      balanced: "Balanced",
      needsWork: "Needs work",
    },
  }

  const t = texts[language]

  const categoryStats = {
    protein: meals.filter((m) => m.category === "protein").length,
    carbs: meals.filter((m) => m.category === "carbs").length,
    veggies: meals.filter((m) => m.category === "veggies").length,
    sweets: meals.filter((m) => m.category === "sweets").length,
  }

  const total = Object.values(categoryStats).reduce((sum, count) => sum + count, 0)

  if (total === 0) {
    return null
  }

  const isBalanced = categoryStats.veggies >= 2 && categoryStats.protein >= 1 && categoryStats.sweets <= 1

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>📊</span>
          {t.title}
          <span className="text-sm">{isBalanced ? "✅ " + t.balanced : "⚠️ " + t.needsWork}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">🍗 {t.protein}</span>
            <span className="text-sm font-medium">{categoryStats.protein}</span>
          </div>
          <Progress value={(categoryStats.protein / Math.max(total, 1)) * 100} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">🍞 {t.carbs}</span>
            <span className="text-sm font-medium">{categoryStats.carbs}</span>
          </div>
          <Progress value={(categoryStats.carbs / Math.max(total, 1)) * 100} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">🥗 {t.veggies}</span>
            <span className="text-sm font-medium">{categoryStats.veggies}</span>
          </div>
          <Progress value={(categoryStats.veggies / Math.max(total, 1)) * 100} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">🍫 {t.sweets}</span>
            <span className="text-sm font-medium">{categoryStats.sweets}</span>
          </div>
          <Progress value={(categoryStats.sweets / Math.max(total, 1)) * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
