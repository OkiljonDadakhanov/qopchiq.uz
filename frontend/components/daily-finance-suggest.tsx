"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface DailyFinanceDigestProps {
  language: "uz" | "ru" | "en";
}

const financeTips = {
  uz: [
    "💰 Har kuni kichik miqdorda tejashni boshlang. Kichik qadamlar katta natijalarga olib keladi!",
    "💡 Moliyaviy fakt: O'rtacha odam o'z daromadining 10% dan ortig'ini tejaydi.",
    "✨ Motivatsion iqtibos: 'Tejash - bu ertangi kun uchun bugungi qurbonlik.'",
    "💸 Keraksiz xarajatlarni kamaytirish uchun byudjet tuzing.",
    "📈 Moliyaviy fakt: Inflyatsiya pulingizning qadrini pasaytiradi, shuning uchun investitsiya qilishni o'rganing.",
    "🌟 Motivatsion iqtibos: 'Boylik - bu sizda bor narsa emas, balki siz kimligingizdir.'",
    "💳 Kredit kartalardan ehtiyot bo'ling, ular qarzga botishga olib kelishi mumkin.",
    "📊 Moliyaviy fakt: Diversifikatsiya - bu investitsiya xavfini kamaytirishning kaliti.",
    "🚀 Motivatsion iqtibos: 'Moliyaviy erkinlik - bu tanlov erkinligi.'",
  ],
  ru: [
    "💰 Начните экономить понемногу каждый день. Маленькие шаги приводят к большим результатам!",
    "💡 Финансовый факт: В среднем человек экономит более 10% своего дохода.",
    "✨ Мотивационная цитата: 'Экономия - это жертва сегодня ради завтрашнего дня.'",
    "💸 Составьте бюджет, чтобы сократить ненужные расходы.",
    "📈 Финансовый факт: Инфляция снижает стоимость ваших денег, поэтому учитесь инвестировать.",
    "🌟 Мотивационная цитата: 'Богатство - это не то, что у вас есть, а то, кто вы есть.'",
    "💳 Будьте осторожны с кредитными картами, они могут привести к долгам.",
    "📊 Финансовый факт: Диверсификация - ключ к снижению инвестиционного риска.",
    "🚀 Мотивационная цитата: 'Финансовая свобода - это свобода выбора.'",
  ],
  en: [
    "💰 Start saving a small amount every day. Small steps lead to big results!",
    "💡 Financial fact: The average person saves more than 10% of their income.",
    "✨ Motivational quote: 'Saving is a sacrifice today for tomorrow.'",
    "💸 Create a budget to cut down on unnecessary expenses.",
    "📈 Financial fact: Inflation erodes the value of your money, so learn to invest.",
    "🌟 Motivational quote: 'Wealth is not what you have, but who you are.'",
    "💳 Be cautious with credit cards, they can lead to debt.",
    "📊 Financial fact: Diversification is key to reducing investment risk.",
    "🚀 Motivational quote: 'Financial freedom is the freedom to choose.'",
  ],
};

export function DailyFinanceDigest({ language }: DailyFinanceDigestProps) {
  const [currentTip, setCurrentTip] = useState("");

  useEffect(() => {
    const today = new Date().getDate();
    const tipIndex = today % financeTips[language].length;
    setCurrentTip(financeTips[language][tipIndex]);
  }, [language]);

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-0 shadow-lg">
      <CardContent className="p-4 text-center">
        <div className="text-sm font-medium text-gray-700">💡 {currentTip}</div>
      </CardContent>
    </Card>
  );
}
