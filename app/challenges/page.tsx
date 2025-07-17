"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { SavingsChallenge } from "@/components/savings-challenge"

interface Expense {
  id: string
  amount: number
  category: string
  emoji: string
  description: string
  date: string
  mood?: string
}

export default function ChallengesPage() {
  const [language, setLanguage] = useState<"uz" | "ru" | "en">("uz")
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    const savedLanguage = localStorage.getItem("qopchiq-language")
    const savedExpenses = localStorage.getItem("qopchiq-expenses")

    if (savedLanguage) setLanguage(savedLanguage as "uz" | "ru" | "en")
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses))
  }, [])

  const texts = {
    uz: {
      title: "Tejash musobaqalari",
    },
    ru: {
      title: "Вызовы экономии",
    },
    en: {
      title: "Savings Challenges",
    },
  }

  const t = texts[language]

  const handleBadgeEarned = (badge: string) => {
    // Handle badge earning logic
    console.log("Badge earned:", badge)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span>🏆</span>
            {t.title}
          </h1>
        </div>

        <SavingsChallenge expenses={expenses} language={language} onBadgeEarned={handleBadgeEarned} />
      </div>

      <Navigation language={language} />
    </div>
  )
}
