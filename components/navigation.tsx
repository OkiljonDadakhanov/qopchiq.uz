"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, TrendingUp, Calculator, Bell, Trophy, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  language: "uz" | "ru" | "en"
}

export function Navigation({ language }: NavigationProps) {
  const pathname = usePathname()

  const texts = {
    uz: {
      home: "Bosh sahifa",
      expenses: "Xarajatlar",
      currency: "Valyuta",
      bills: "Hisob-kitob",
      challenges: "Musobaqalar",
      analytics: "Tahlil",
      settings: "Sozlamalar",
    },
    ru: {
      home: "Главная",
      expenses: "Расходы",
      currency: "Валюта",
      bills: "Счета",
      challenges: "Вызовы",
      analytics: "Аналитика",
      settings: "Настройки",
    },
    en: {
      home: "Home",
      expenses: "Expenses",
      currency: "Currency",
      bills: "Bills",
      challenges: "Challenges",
      analytics: "Analytics",
      settings: "Settings",
    },
  }

  const t = texts[language]

  const navItems = [
    { href: "/", icon: Home, label: t.home },
    { href: "/expenses", icon: TrendingUp, label: t.expenses },
    { href: "/currency-converter", icon: Calculator, label: t.currency },
    { href: "/bills", icon: Bell, label: t.bills },
    { href: "/challenges", icon: Trophy, label: t.challenges },
    { href: "/analytics", icon: BarChart3, label: t.analytics },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col gap-1 h-auto py-2 px-3 ${
                    isActive ? "text-blue-600 bg-blue-50" : "text-gray-600"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
