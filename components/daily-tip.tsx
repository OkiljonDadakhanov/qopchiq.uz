"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface DailyTipProps {
  language: "uz" | "ru" | "en"
}

const tips = {
  uz: [
    "💧 Ichimlik suvidan ko'proq iching - 2 litr bugun!",
    "🍎 Shirinlikni meva bilan almashtiring",
    "🚶‍♂️ Har kuni 10,000 qadam yuring",
    "💰 Har kuni xarajatlaringizni yozib boring",
    "🥗 Har ovqatda sabzavot qo'shing",
    "😴 7-8 soat uxlash juda muhim",
    "📱 Telefonsiz 1 soat o'tkazing",
  ],
  ru: [
    "💧 Пейте больше воды - 2 литра сегодня!",
    "🍎 Замените сладости фруктами",
    "🚶‍♂️ Ходите 10,000 шагов каждый день",
    "💰 Записывайте свои расходы каждый день",
    "🥗 Добавляйте овощи в каждый прием пищи",
    "😴 7-8 часов сна очень важно",
    "📱 Проведите 1 час без телефона",
  ],
  en: [
    "💧 Drink more water - 2 liters today!",
    "🍎 Replace sweets with fruits",
    "🚶‍♂️ Walk 10,000 steps every day",
    "💰 Track your expenses daily",
    "🥗 Add vegetables to every meal",
    "😴 7-8 hours of sleep is crucial",
    "📱 Spend 1 hour without your phone",
  ],
}

export function DailyTip({ language }: DailyTipProps) {
  const [currentTip, setCurrentTip] = useState("")

  useEffect(() => {
    const today = new Date().getDate()
    const tipIndex = today % tips[language].length
    setCurrentTip(tips[language][tipIndex])
  }, [language])

  return (
    <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-0 shadow-lg">
      <CardContent className="p-4 text-center">
        <div className="text-sm font-medium text-gray-700">💡 {currentTip}</div>
      </CardContent>
    </Card>
  )
}
