// app/more/page.tsx
"use client";
import Link from "next/link";
import {
  Trophy,
  BarChart3,
  Target,
  Handshake,
  HeartPulse,
  LifeBuoy,
} from "lucide-react";

export default function MorePage() {
  const moreItems = [
    { href: "/challenges", icon: Trophy, label: "Challenges" },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/debts", icon: Handshake, label: "Debts" },
    { href: "/health", icon: HeartPulse, label: "Health" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/support", icon: LifeBuoy, label: "Support" },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold mb-4">More Features</h1>
      {moreItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-4 p-3 bg-white shadow rounded-lg hover:bg-blue-50 transition"
        >
          <item.icon className="h-5 w-5 text-blue-600" />
          <span className="text-gray-800">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
