"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Droplets, Settings } from "lucide-react";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { AddMealModal } from "@/components/add-meal-modal";
import { ExpenseList } from "@/components/expense-list";
import { DailyTip } from "@/components/daily-tip";
import { SpendingLimit } from "@/components/spending-limit";
import { Gamification } from "@/components/gamification";
import { Navigation } from "@/components/navigation";
import { calculateStreak } from "@/components/streak-calculator";
import { DailyFinanceDigest } from "@/components/daily-finance-suggest";

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

interface Meal {
  id: string;
  name: string;
  calories: number;
  emoji: string;
  date: string;
  category: "protein" | "carbs" | "veggies" | "sweets";
}

interface UserData {
  monthlyLimit: number;
  currentBalance: number;
  level: number;
  coins: number;
  streak: number;
  badges: string[];
}

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [language, setLanguage] = useState<"uz" | "ru" | "en">("uz");
  const [userData, setUserData] = useState<UserData>({
    monthlyLimit: 1000000,
    currentBalance: 500000,
    level: 1,
    coins: 0,
    streak: 0,
    badges: [],
  });

  useEffect(() => {
    const savedExpenses = localStorage.getItem("qopchiq-expenses");
    const savedMeals = localStorage.getItem("qopchiq-meals");
    const savedWater = localStorage.getItem("qopchiq-water");
    const savedLanguage = localStorage.getItem("qopchiq-language");
    const savedUserData = localStorage.getItem("qopchiq-userdata");

    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedMeals) setMeals(JSON.parse(savedMeals));
    if (savedWater) setWaterIntake(Number.parseInt(savedWater));
    if (savedLanguage) setLanguage(savedLanguage as "uz" | "ru" | "en");
    if (savedUserData) setUserData(JSON.parse(savedUserData));
  }, []);

  useEffect(() => {
    const newStreak = calculateStreak(expenses, meals, waterIntake);
    if (!isNaN(newStreak)) {
      setUserData((prev) => {
        const updated = { ...prev, streak: newStreak };
        localStorage.setItem("qopchiq-userdata", JSON.stringify(updated));
        return updated;
      });
    }
  }, [expenses, meals, waterIntake]);

  useEffect(() => {
    localStorage.setItem("qopchiq-expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("qopchiq-meals", JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("qopchiq-water", waterIntake.toString());
    const today = new Date().toDateString();
    localStorage.setItem(`qopchiq-water-${today}`, waterIntake.toString());
  }, [waterIntake]);

  useEffect(() => {
    localStorage.setItem("qopchiq-userdata", JSON.stringify(userData));
  }, [userData]);
  useEffect(() => {
    const today = new Date().toDateString();
    const lastUpdated = localStorage.getItem("qopchiq-last-updated");

    if (lastUpdated !== today) {
      setWaterIntake(0); // Reset water
      localStorage.setItem("qopchiq-last-updated", today);

      // Optionally trigger other resets or updates like daily challenges, daily tips
    }
  }, []);

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayExpenses = expenses.filter(
    (expense) => new Date(expense.date).toDateString() === today.toDateString()
  );
  const monthlyExpenses = expenses.filter(
    (expense) => new Date(expense.date) >= startOfMonth
  );
  const todayMeals = meals.filter(
    (meal) => new Date(meal.date).toDateString() === today.toDateString()
  );

  const todayCalories = todayMeals.reduce(
    (sum, meal) => sum + meal.calories,
    0
  );
  const todaySpent = todayExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const monthlySpent = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    setExpenses((prev) => [newExpense, ...prev]);

    const newCoins = userData.coins + 10;
    const newLevel = Math.floor(newCoins / 100) + 1;
    setUserData((prev) => ({ ...prev, coins: newCoins, level: newLevel }));
  };

  const addMeal = (meal: Omit<Meal, "id">) => {
    const newMeal = { ...meal, id: Date.now().toString() };
    setMeals((prev) => [newMeal, ...prev]);

    const newCoins = userData.coins + 5;
    const newLevel = Math.floor(newCoins / 100) + 1;
    setUserData((prev) => ({ ...prev, coins: newCoins, level: newLevel }));
  };

  const addWater = () => {
    if (waterIntake < 8) {
      const newWaterIntake = waterIntake + 1;
      setWaterIntake(newWaterIntake);

      const newCoins = userData.coins + 2;
      const newLevel = Math.floor(newCoins / 100) + 1;
      setUserData((prev) => ({ ...prev, coins: newCoins, level: newLevel }));
    }
  };

  const texts = {
    uz: {
      title: "Qopchiq.uz",
      subtitle: "Moliyaviy va sog'liq yordamchingiz",
      todaySpent: "Bugun sarflangan",
      todayCalories: "Bugun kaloriya",
      waterProgress: "Suv ichish",
      addExpense: "Xarajat qo'shish",
      addMeal: "Ovqat qo'shish",
      glasses: "stakan",
      sum: "so'm",
    },
    ru: {
      title: "Qopchiq.uz",
      subtitle: "Ваш финансовый и здоровый помощник",
      todaySpent: "Потрачено сегодня",
      todayCalories: "Калории сегодня",
      waterProgress: "Потребление воды",
      addExpense: "Добавить расход",
      addMeal: "Добавить еду",
      glasses: "стаканов",
      sum: "сум",
    },
    en: {
      title: "Qopchiq.uz",
      subtitle: "Your financial & health buddy",
      todaySpent: "Spent today",
      todayCalories: "Calories today",
      waterProgress: "Water intake",
      addExpense: "Add Expense",
      addMeal: "Add Meal",
      glasses: "glasses",
      sum: "UZS",
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl">💰</div>
              <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const langs: ("uz" | "ru" | "en")[] = ["uz", "ru", "en"];
                const currentIndex = langs.indexOf(language);
                const nextLang = langs[(currentIndex + 1) % langs.length];
                setLanguage(nextLang);
                localStorage.setItem("qopchiq-language", nextLang);
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600 text-sm">{t.subtitle}</p>
        </div>

        <Gamification userData={userData} language={language} />
        <DailyFinanceDigest language={language} />
        <DailyTip language={language} />

        <SpendingLimit
          monthlySpent={monthlySpent}
          monthlyLimit={userData.monthlyLimit}
          language={language}
          onUpdateLimit={(newLimit) =>
            setUserData((prev) => ({ ...prev, monthlyLimit: newLimit }))
          }
        />

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">💸</div>
              <div className="text-sm text-gray-600">{t.todaySpent}</div>
              <div className="text-lg font-bold text-red-600">
                {todaySpent.toLocaleString()} {t.sum}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🔥</div>
              <div className="text-sm text-gray-600">{t.todayCalories}</div>
              <div className="text-lg font-bold text-orange-600">
                {todayCalories} kcal
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{t.waterProgress}</span>
              </div>
              <Badge variant="secondary">
                {waterIntake}/8 {t.glasses}
              </Badge>
            </div>
            <Progress value={(waterIntake / 8) * 100} className="mb-3" />
            <Button
              onClick={addWater}
              disabled={waterIntake >= 8}
              className="w-full"
              variant={waterIntake >= 8 ? "secondary" : "default"}
            >
              💧{" "}
              {waterIntake >= 8
                ? "Barakalla! +2 Qopchiq Coins"
                : "Suv ichish (+2 Qopchiq Coins)"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setShowExpenseModal(true)}
            className="h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-lg"
          >
            <div className="text-center">
              <Plus className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm">{t.addExpense}</div>
              <div className="text-xs opacity-80">+10 Qopchiq Coins</div>
            </div>
          </Button>

          <Button
            onClick={() => setShowMealModal(true)}
            className="h-16 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg"
          >
            <div className="text-center">
              <Plus className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm">{t.addMeal}</div>
              <div className="text-xs opacity-80">+5 Qopchiq Coins</div>
            </div>
          </Button>
        </div>

        <ExpenseList expenses={todayExpenses.slice(0, 5)} language={language} />

        <AddExpenseModal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          onAdd={addExpense}
          language={language}
          currentBalance={userData.currentBalance}
          monthlySpent={monthlySpent}
          monthlyLimit={userData.monthlyLimit}
        />

        <AddMealModal
          isOpen={showMealModal}
          onClose={() => setShowMealModal(false)}
          onAdd={addMeal}
          language={language}
        />
      </div>

      <Navigation language={language} />
    </div>
  );
}
