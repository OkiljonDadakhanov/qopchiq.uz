"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { CalendarView } from "@/components/calendar-view";

interface Bill {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
}

interface Debt {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type: "owed" | "lent";
  isPaid: boolean;
}

export default function CalendarPage() {
  const [language, setLanguage] = useState<"uz" | "ru" | "en">("uz");
  const [bills, setBills] = useState<Bill[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("qopchiq-language");
    const savedBills = localStorage.getItem("qopchiq-bills"); // Assuming bills are saved here
    const savedDebts = localStorage.getItem("qopchiq-debts"); // Assuming debts are saved here

    if (savedLanguage) setLanguage(savedLanguage as "uz" | "ru" | "en");
    if (savedBills) setBills(JSON.parse(savedBills));
    if (savedDebts) setDebts(JSON.parse(savedDebts));
  }, []);

  const texts = {
    uz: {
      title: "To'lovlar kalendari",
    },
    ru: {
      title: "Календарь платежей",
    },
    en: {
      title: "Payments Calendar",
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span>🗓️</span>
            {t.title}
          </h1>
        </div>

        <CalendarView language={language} bills={bills} debts={debts} />
      </div>

      <Navigation language={language} />
    </div>
  );
}
