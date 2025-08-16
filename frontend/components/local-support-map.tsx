"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LocalSupportMapProps {
  language: "uz" | "ru" | "en";
}

export function LocalSupportMap({ language }: LocalSupportMapProps) {
  const texts = {
    uz: {
      title: "Mahalliy yordam xaritasi",
      description:
        "Yaqin atrofdagi klinikalar, sport zallari, sog'lom ovqatlanish joylari va moliyaviy maslahatchilarni toping.",
      searchPlaceholder: "Qidirish...",
      findOnMap: "Xaritada topish",
      note: "Bu xarita faqat namoyish uchun. Haqiqiy ma'lumotlar uchun Google Maps yoki boshqa xarita xizmatlaridan foydalaning.",
    },
    ru: {
      title: "Карта местной поддержки",
      description:
        "Найдите ближайшие клиники, спортзалы, места здорового питания и финансовых консультантов.",
      searchPlaceholder: "Поиск...",
      findOnMap: "Найти на карте",
      note: "Эта карта предназначена только для демонстрации. Для реальных данных используйте Google Maps или другие картографические сервисы.",
    },
    en: {
      title: "Local Support Map",
      description:
        "Find nearby clinics, gyms, healthy food spots, and financial advisors.",
      searchPlaceholder: "Search...",
      findOnMap: "Find on Map",
      note: "This map is for demonstration purposes only. For real data, use Google Maps or other map services.",
    },
  };

  const t = texts[language];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{t.description}</p>
        <div className="flex gap-2">
          <Input placeholder={t.searchPlaceholder} className="flex-1" />
          <Button>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
          [ {t.findOnMap} ]
        </div>
        <p className="text-xs text-gray-500 text-center italic">{t.note}</p>
      </CardContent>
    </Card>
  );
}
