"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { DebtTracker } from "@/components/debt-tracker";

export default function DebtsPage() {
  const [language, setLanguage] = useState<"uz" | "ru" | "en">("uz");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("qopchiq-language");
    if (savedLanguage) setLanguage(savedLanguage as "uz" | "ru" | "en");
  }, []);

  const texts = {
    uz: {
      title: "Qarzlarim",
    },
    ru: {
      title: "Мои долги",
    },
    en: {
      title: "My Debts",
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span>🤝</span>
            {t.title}
          </h1>
        </div>

        <DebtTracker language={language} />
      </div>

      <Navigation language={language} />
    </div>
  );
}
