"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Expense {
  id: string
  amount: number
  category: string
  emoji: string
  description: string
  date: string
  mood?: string
}

interface ExpenseListProps {
  expenses: Expense[]
  language: "uz" | "ru" | "en"
}

export function ExpenseList({ expenses, language }: ExpenseListProps) {
  const texts = {
    uz: {
      title: "Bugungi xarajatlar",
      noExpenses: "Bugun hech qanday xarajat yo'q",
      sum: "so'm",
    },
    ru: {
      title: "Сегодняшние расходы",
      noExpenses: "Сегодня нет расходов",
      sum: "сум",
    },
    en: {
      title: "Today's Expenses",
      noExpenses: "No expenses today",
      sum: "UZS",
    },
  }

  const t = texts[language]

  if (expenses.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4 text-center text-gray-500">
          <div className="text-4xl mb-2">💸</div>
          <p>{t.noExpenses}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{expense.emoji}</span>
              <div>
                <div className="font-medium">{expense.description || expense.category}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  {expense.mood && (
                    <span>
                      {expense.mood === "happy" && "😊"}
                      {expense.mood === "neutral" && "😐"}
                      {expense.mood === "sad" && "😔"}
                      {expense.mood === "stressed" && "😤"}
                    </span>
                  )}
                  <span>
                    {new Date(expense.date).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="font-bold">
              {expense.amount.toLocaleString()} {t.sum}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
