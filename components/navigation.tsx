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
    },
    ru: {
      home: "Главная",
      expenses: "Расходы",
      currency: "Валюта",
      bills: "Счета",
      challenges: "Вызовы",
      analytics: "Аналитика",
    },
    en: {
      home: "Home",
      expenses: "Expenses",
      currency: "Currency",
      bills: "Bills",
      challenges: "Challenges",
      analytics: "Analytics",
    },
  };

  const t = texts[language];

  const navItems = [
    { href: "/", icon: Home, label: t.home },
    { href: "/expenses", icon: TrendingUp, label: t.expenses },
    { href: "/currency-converter", icon: Calculator, label: t.currency },
    { href: "/bills", icon: Bell, label: t.bills },
    { href: "/challenges", icon: Trophy, label: t.challenges },
    { href: "/analytics", icon: BarChart3, label: t.analytics },
  ];

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 md:hidden">
        <div className="mx-auto max-w-lg">
          <div className="flex justify-between items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-md ${
                      isActive ? "text-blue-600 bg-blue-50" : "text-gray-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] leading-tight">
                      {item.label}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop sidebar nav */}
      <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-full md:w-60 bg-white border-r border-gray-200 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-2 ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
