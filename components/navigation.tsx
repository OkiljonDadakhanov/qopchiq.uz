"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Calculator,
  Bell,
  Trophy,
  BarChart3,
  Target,
  CalendarDays,
  Handshake,
  HeartPulse,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavigationProps {
  language: "uz" | "ru" | "en";
}

export function Navigation({ language }: NavigationProps) {
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(false);

  const texts = {
    uz: {
      home: "Bosh sahifa",
      expenses: "Xarajatlar",
      currency: "Valyuta",
      bills: "Hisob-kitob",
      challenges: "Musobaqalar",
      analytics: "Tahlil",
      goals: "Maqsadlar",
      debts: "Qarzlar",
      calendar: "Kalendar",
      health: "Sog'liq",
      support: "Yordam",
      more: "Ko‘proq",
    },
    ru: {
      home: "Главная",
      expenses: "Расходы",
      currency: "Валюта",
      bills: "Счета",
      challenges: "Вызовы",
      analytics: "Аналитика",
      goals: "Цели",
      debts: "Долги",
      calendar: "Календарь",
      health: "Здоровье",
      support: "Поддержка",
      more: "Еще",
    },
    en: {
      home: "Home",
      expenses: "Expenses",
      currency: "Currency",
      bills: "Bills",
      challenges: "Challenges",
      analytics: "Analytics",
      goals: "Goals",
      debts: "Debts",
      calendar: "Calendar",
      health: "Health",
      support: "Support",
      more: "More",
    },
  };

  const t = texts[language];

  const navItems = [
    { href: "/", icon: Home, label: t.home },
    { href: "/expenses", icon: TrendingUp, label: t.expenses },
    { href: "/bills", icon: Bell, label: t.bills },
    { href: "/debts", icon: Handshake, label: t.debts },
    { href: "/goals", icon: Target, label: t.goals },
    { href: "/health", icon: HeartPulse, label: t.health },
    { href: "/analytics", icon: BarChart3, label: t.analytics },
    { href: "/currency-converter", icon: Calculator, label: t.currency },
    { href: "/calendar", icon: CalendarDays, label: t.calendar },
    { href: "/challenges", icon: Trophy, label: t.challenges },
    { href: "/support", icon: CalendarDays, label: t.support }, // Assuming support uses the same icon as calendar

  ];

  const visibleItems = navItems.slice(0, 5);
  const overflowItems = navItems.slice(5);

  return (
    <>
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
        <div className="max-w-full overflow-x-auto">
          <div className="flex flex-nowrap justify-between items-center gap-1 sm:gap-2 min-w-max">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex flex-col items-center gap-1 h-auto min-w-[60px] px-2 py-1 ${
                      isActive ? "text-blue-600 bg-blue-50" : "text-gray-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] sm:text-xs leading-tight text-center">
                      {item.label}
                    </span>
                  </Button>
                </Link>
              );
            })}

            {/* More Button */}
            {overflowItems.length > 0 && (
              <Button
                onClick={() => setShowSidebar(true)}
                variant="ghost"
                size="sm"
                className="flex flex-col items-center gap-1 h-auto min-w-[60px] px-2 py-1 text-gray-600"
              >
                <Menu className="h-5 w-5" />
                <span className="text-[10px] sm:text-xs leading-tight text-center">
                  {t.more}
                </span>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar Drawer */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
          <div className="w-64 bg-white h-full p-4 shadow-lg flex flex-col gap-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{t.more}</h2>
              <button onClick={() => setShowSidebar(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            {overflowItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowSidebar(false)}
                >
                  <div
                    className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 ${
                      isActive ? "text-blue-600 bg-blue-50" : "text-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
