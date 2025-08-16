"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { GoalSetter } from "@/components/goal-setter";

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

export default function GoalsPage() {
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
      title: "Maqsadlarim",
    },
    ru: {
      title: "Мои цели",
    },
    en: {
      title: "My Goals",
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span>🎯</span>
            {t.title}
          </h1>
        </div>

        <GoalSetter language={language} expenses={expenses} />
      </div>

      <Navigation language={language} />
    </div>
  );
}
