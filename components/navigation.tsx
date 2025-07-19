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
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  language: "uz" | "ru" | "en";
}

export function Navigation({ language }: NavigationProps) {
  const pathname = usePathname();

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
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
      <div className="max-w-full overflow-x-auto">
        <div className="flex flex-nowrap justify-between items-center gap-1 sm:gap-2 min-w-max">
          {navItems.map((item) => {
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
        </div>
      </div>
    </nav>
  );
}
