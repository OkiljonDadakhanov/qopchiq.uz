"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { LocalSupportMap } from "@/components/local-support-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Phone, Mail } from "lucide-react";

export default function SupportPage() {
  const [language, setLanguage] = useState<"uz" | "ru" | "en">("uz");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("qopchiq-language");
    if (savedLanguage) setLanguage(savedLanguage as "uz" | "ru" | "en");
  }, []);

  const texts = {
    uz: {
      title: "Yordam va qo'llab-quvvatlash",
      contactUs: "Biz bilan bog'lanish",
      contactDesc:
        "Savollaringiz yoki takliflaringiz bormi? Bizga murojaat qiling!",
      email: "Elektron pochta",
      phone: "Telefon",
      chat: "Jonli chat",
    },
    ru: {
      title: "Помощь и поддержка",
      contactUs: "Связаться с нами",
      contactDesc: "Есть вопросы или предложения? Свяжитесь с нами!",
      email: "Электронная почта",
      phone: "Телефон",
      chat: "Живой чат",
    },
    en: {
      title: "Help & Support",
      contactUs: "Contact Us",
      contactDesc: "Have questions or suggestions? Reach out to us!",
      email: "Email",
      phone: "Phone",
      chat: "Live Chat",
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span>❓</span>
            {t.title}
          </h1>
        </div>

        {/* Local Support Map */}
        <LocalSupportMap language={language} />

        {/* Contact Us */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t.contactUs}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">{t.contactDesc}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <a
                  href="mailto:support@qopchiq.uz"
                  className="text-blue-600 hover:underline"
                >
                  support@qopchiq.uz
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-500" />
                <a
                  href="tel:+998901234567"
                  className="text-green-600 hover:underline"
                >
                  +998 90 123 45 67
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                <span className="text-gray-700">{t.chat} (Tez orada!)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Navigation language={language} />
    </div>
  );
}
