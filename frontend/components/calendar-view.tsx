"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface CalendarViewProps {
  language: "uz" | "ru" | "en";
  bills: Bill[];
  debts: Debt[];
}

export function CalendarView({ language, bills, debts }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const texts = {
    uz: {
      title: "To'lovlar kalendari",
      months: [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "Iyun",
        "Iyul",
        "Avgust",
        "Sentyabr",
        "Oktyabr",
        "Noyabr",
        "Dekabr",
      ],
      weekdays: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"],
      bill: "Hisob",
      debt: "Qarz",
      owed: "Qarzim",
      lent: "Bergan qarzim",
    },
    ru: {
      title: "Календарь платежей",
      months: [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
      ],
      weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      bill: "Счет",
      debt: "Долг",
      owed: "Мой долг",
      lent: "Мне должны",
    },
    en: {
      title: "Payments Calendar",
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      bill: "Bill",
      debt: "Debt",
      owed: "I Owe",
      lent: "Owed to Me",
    },
  };

  const t = texts[language];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start (0=Sunday, 1=Monday... -> 0=Monday, 6=Sunday)
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null); // Placeholder for empty days at the start of the month
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    const date = new Date(currentYear, currentMonth, day);
    const dateString = date.toISOString().split("T")[0];

    const dailyEvents: { type: "bill" | "debt"; item: Bill | Debt }[] = [];

    bills.forEach((bill) => {
      if (bill.dueDate === dateString && !bill.isPaid) {
        dailyEvents.push({ type: "bill", item: bill });
      }
    });

    debts.forEach((debt) => {
      if (debt.dueDate === dateString && !debt.isPaid) {
        dailyEvents.push({ type: "debt", item: debt });
      }
    });

    return dailyEvents;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            {t.months[currentMonth]} {currentYear}
          </h2>
          <Button variant="ghost" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600">
          {t.weekdays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const events = getEventsForDate(day);
            const isToday =
              day &&
              currentMonth === new Date().getMonth() &&
              currentYear === new Date().getFullYear() &&
              day === new Date().getDate();

            return (
              <div
                key={index}
                className={`relative h-20 p-1 text-xs border rounded-md flex flex-col items-center ${
                  day ? "bg-gray-50" : "bg-gray-100"
                } ${
                  isToday
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200"
                }`}
              >
                <span className={`font-bold ${isToday ? "text-blue-600" : ""}`}>
                  {day}
                </span>
                <div className="mt-1 space-y-0.5 overflow-y-auto w-full">
                  {events.map((event, eventIndex) => (
                    <Badge
                      key={eventIndex}
                      variant={
                        event.type === "bill" ? "destructive" : "secondary"
                      }
                      className="w-full justify-center text-xs px-1 py-0.5"
                    >
                      {event.type === "bill"
                        ? event.item.emoji
                        : event.item.type === "owed"
                        ? "🔻"
                        : "🔺"}{" "}
                      {event.item.amount.toLocaleString()}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
