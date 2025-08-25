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
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  language: "uz" | "en";
}

type NavItem = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

export function Navigation({ language }: NavigationProps) {
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(false);
  const { isAuthenticated, logout } = useAuth();

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
      profile: "Profil",
      settings: "Sozlamalar",
      login: "Kirish",
      register: "Ro'yxatdan o'tish",
      logout: "Chiqish",
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
      profile: "Profile",
      settings: "Settings",
      login: "Login",
      register: "Register",
      logout: "Logout",
    },
  } as const;

  const t = texts[language] ?? texts.en;

  const navItems: NavItem[] = useMemo(
    () => [
      { href: "/", icon: Home, label: t.home },
      { href: "/expenses", icon: BarChart3, label: t.expenses },
      { href: "/currency-converter", icon: Calculator, label: t.currency },
      { href: "/bills", icon: Bell, label: t.bills },
      { href: "/challenges", icon: Trophy, label: t.challenges },
      { href: "/analytics", icon: TrendingUp, label: t.analytics },
      { href: "/goals", icon: Target, label: t.goals },
      { href: "/debts", icon: Handshake, label: t.debts },
      { href: "/calendar", icon: CalendarDays, label: t.calendar },
      { href: "/health", icon: HeartPulse, label: t.health },
      { href: "/support", icon: Handshake, label: t.support },
      { href: "/profile", icon: User, label: t.profile },
      { href: "/settings", icon: Settings, label: t.settings },
    ],
    [t]
  );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setShowSidebar(true)}
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm border shadow-sm"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* Backdrop for mobile */}
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />

        {/* Sidebar content */}
        <div className="relative w-64 h-full bg-white border-r border-gray-200 shadow-lg flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Qopchiq.uz</h1>
            <Button
              onClick={() => setShowSidebar(false)}
              variant="ghost"
              size="sm"
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href} onClick={() => setShowSidebar(false)}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? "text-blue-600" : "text-gray-500"}`} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Auth Section */}
          <div className="p-4 border-t border-gray-200">
            {isAuthenticated ? (
              <Button
                variant="outline"
                onClick={logout}
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t.logout}
              </Button>
            ) : (
              <div className="space-y-2">
                <Link href="/auth">
                  <Button variant="outline" className="w-full">
                    {t.login}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {t.register}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
