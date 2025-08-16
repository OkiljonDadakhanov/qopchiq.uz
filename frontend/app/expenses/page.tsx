"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { AddExpenseModal } from "@/components/add-expense-modal"

interface Expense {
  id: string
  amount: number
  category: string
  emoji: string
  description: string
  date: string
  mood?: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [language, setLanguage] = useState<"uz" | "ru" | "en">("uz")
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all")

  useEffect(() => {
    const savedExpenses = localStorage.getItem("qopchiq-expenses")
    const savedLanguage = localStorage.getItem("qopchiq-language")

    if (savedExpenses) setExpenses(JSON.parse(savedExpenses))
    if (savedLanguage) setLanguage(savedLanguage as "uz" | "ru" | "en")
  }, [])

  const texts = {
    uz: {
      title: "Xarajatlar",
      addExpense: "Xarajat qo'shish",
      search: "Qidirish",
      filter: "Filtr",
      all: "Hammasi",
      today: "Bugun",
      week: "Bu hafta",
      month: "Bu oy",
      total: "Jami",
      average: "O'rtacha",
      highest: "Eng yuqori",
      categories: "Kategoriyalar",
      noExpenses: "Xarajatlar topilmadi",
    },
    ru: {
      title: "Расходы",
      addExpense: "Добавить расход",
      search: "Поиск",
      filter: "Фильтр",
      all: "Все",
      today: "Сегодня",
      week: "На этой неделе",
      month: "В этом месяце",
      total: "Всего",
      average: "Среднее",
      highest: "Самый высокий",
      categories: "Категории",
      noExpenses: "Расходы не найдены",
    },
    en: {
      title: "Expenses",
      addExpense: "Add Expense",
      search: "Search",
      filter: "Filter",
      all: "All",
      today: "Today",
      week: "This Week",
      month: "This Month",
      total: "Total",
      average: "Average",
      highest: "Highest",
      categories: "Categories",
      noExpenses: "No expenses found",
    },
  }

  const t = texts[language]

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = { ...expense, id: Date.now().toString() }
    const updatedExpenses = [newExpense, ...expenses]
    setExpenses(updatedExpenses)
    localStorage.setItem("qopchiq-expenses", JSON.stringify(updatedExpenses))
  }

  // Filter expenses based on search, category, and date
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory === "all" || expense.category === filterCategory

    const expenseDate = new Date(expense.date)
    const now = new Date()
    let matchesDate = true

    if (dateFilter === "today") {
      matchesDate = expenseDate.toDateString() === now.toDateString()
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      matchesDate = expenseDate >= weekAgo
    } else if (dateFilter === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      matchesDate = expenseDate >= monthStart
    }

    return matchesSearch && matchesCategory && matchesDate
  })

  // Calculate statistics
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averageAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0
  const highestExpense = filteredExpenses.reduce(
    (max, expense) => (expense.amount > max.amount ? expense : max),
    filteredExpenses[0] || { amount: 0 },
  )

  // Category breakdown
  const categoryTotals = filteredExpenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const categories = Object.keys(categoryTotals)
    .map((category) => ({
      category,
      total: categoryTotals[category],
      percentage: totalAmount > 0 ? (categoryTotals[category] / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span>💸</span>
            {t.title}
          </h1>
        </div>

        {/* Add Expense Button */}
        <Button
          onClick={() => setShowAddModal(true)}
          className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg"
        >
          + {t.addExpense}
        </Button>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 space-y-3">
            <Input placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

            <div className="flex gap-2 flex-wrap">
              {["all", "today", "week", "month"].map((filter) => (
                <Button
                  key={filter}
                  variant={dateFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateFilter(filter as any)}
                >
                  {t[filter as keyof typeof t]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-lg mb-1">💰</div>
              <div className="text-xs text-gray-600">{t.total}</div>
              <div className="text-sm font-bold text-red-600">{totalAmount.toLocaleString()} so'm</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-lg mb-1">📊</div>
              <div className="text-xs text-gray-600">{t.average}</div>
              <div className="text-sm font-bold text-blue-600">{averageAmount.toLocaleString()} so'm</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-lg mb-1">⬆️</div>
              <div className="text-xs text-gray-600">{t.highest}</div>
              <div className="text-sm font-bold text-orange-600">{highestExpense.amount.toLocaleString()} so'm</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        {categories.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{t.categories}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {cat.category === "food" && "🍕"}
                      {cat.category === "transport" && "🚗"}
                      {cat.category === "home" && "🏠"}
                      {cat.category === "clothes" && "👕"}
                      {cat.category === "entertainment" && "🎮"}
                      {cat.category === "health" && "💊"}
                      {cat.category === "education" && "📚"}
                      {cat.category === "other" && "💰"}
                    </span>
                    <span className="font-medium capitalize">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{cat.total.toLocaleString()} so'm</div>
                    <div className="text-xs text-gray-500">{cat.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Expenses List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Xarajatlar ro'yxati</span>
              <Badge variant="secondary">{filteredExpenses.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredExpenses.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📝</div>
                <p>{t.noExpenses}</p>
              </div>
            ) : (
              filteredExpenses.map((expense) => (
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
                          {new Date(expense.date).toLocaleDateString("uz-UZ")}{" "}
                          {new Date(expense.date).toLocaleTimeString("uz-UZ", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-bold">
                    {expense.amount.toLocaleString()} so'm
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <AddExpenseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={addExpense}
          language={language}
          currentBalance={500000}
          monthlySpent={0}
          monthlyLimit={1000000}
        />
      </div>

      <Navigation language={language} />
    </div>
  )
}
