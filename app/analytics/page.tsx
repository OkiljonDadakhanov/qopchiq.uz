"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { MoodAnalysis } from "@/components/mood-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart } from "lucide-react"; // Icons for charts

interface Expense {
  id: string;
  amount: number;
  category: string;
  emoji: string;
  description: string;
  date: string;
  mood?: string;
  location?: string;
}

export default function AnalyticsPage() {
  const [language, setLanguage] = useState<"uz" | "ru" | "en">("uz");
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("qopchiq-language");
    const savedExpenses = localStorage.getItem("qopchiq-expenses");

    if (savedLanguage) setLanguage(savedLanguage as "uz" | "ru" | "en");
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  const texts = {
    uz: {
      title: "Tahlil va statistika",
      expenseBreakdown: "Xarajatlar taqsimoti",
      dailySpending: "Kunlik xarajatlar",
      noData: "Ma'lumotlar yo'q",
    },
    ru: {
      title: "Аналитика и статистика",
      expenseBreakdown: "Разбивка расходов",
      dailySpending: "Ежедневные расходы",
      noData: "Нет данных",
    },
    en: {
      title: "Analytics & Statistics",
      expenseBreakdown: "Expense Breakdown",
      dailySpending: "Daily Spending",
      noData: "No data",
    },
  };

  const t = texts[language];

  // Calculate expense breakdown by category
  const categoryData = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalExpenses = Object.values(categoryData).reduce(
    (sum, amount) => sum + amount,
    0
  );

  const categoryPercentages = Object.entries(categoryData).map(
    ([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    })
  );

  // Calculate daily spending
  const dailySpendingData = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date).toLocaleDateString("en-CA"); // YYYY-MM-DD for consistent key
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedDailySpending = Object.entries(dailySpendingData)
    .sort(
      ([dateA], [dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime()
    )
    .slice(-7); // Last 7 days

  const categoryEmojis = {
    food: "🍕",
    transport: "🚗",
    home: "🏠",
    clothes: "👕",
    entertainment: "🎮",
    health: "💊",
    education: "📚",
    other: "💰",
  } as Record<string, string>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span>📊</span>
            {t.title}
          </h1>
        </div>

        {/* Mood Analysis */}
        <MoodAnalysis expenses={expenses} language={language} />

        {/* Expense Breakdown Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t.expenseBreakdown}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalExpenses === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📈</div>
                <p>{t.noData}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categoryPercentages.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {categoryEmojis[cat.category]} {cat.category}
                      </span>
                      <span>{cat.amount.toLocaleString()} so'm</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {cat.percentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Spending Chart (Simple Bar Chart) */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              {t.dailySpending}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedDailySpending.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📊</div>
                <p>{t.noData}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedDailySpending.map(([date, amount]) => (
                  <div key={date} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-16">
                      {new Date(date).toLocaleDateString(
                        language === "uz" ? "uz-UZ" : undefined,
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                    <div className="flex-1 h-6 bg-blue-100 rounded-md relative">
                      <div
                        className="h-full bg-blue-500 rounded-md"
                        style={{
                          width: `${
                            (amount /
                              Math.max(...Object.values(dailySpendingData))) *
                            100
                          }%`,
                        }}
                      ></div>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-900">
                        {amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Navigation language={language} />
    </div>
  );
}
