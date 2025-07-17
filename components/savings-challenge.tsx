"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, Target } from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  category: string;
  emoji: string;
  description: string;
  date: string;
  mood?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: "daily" | "weekly" | "monthly";
  targetReduction: number;
  badge: string;
  isCompleted: boolean;
  progress: number;
}

interface SavingsChallengeProps {
  expenses: Expense[];
  language: "uz" | "ru" | "en";
  onBadgeEarned: (badge: string) => void;
}

export function SavingsChallenge({
  expenses,
  language,
  onBadgeEarned,
}: SavingsChallengeProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "1",
      title: "Fast Food Challenge",
      description: "Spend 10% less on 🍔 Fast food this week",
      category: "food",
      frequency: "weekly",
      targetReduction: 10,
      badge: "🎖️ Healthy Eater",
      isCompleted: false,
      progress: 0,
    },
    {
      id: "2",
      title: "Transport Daily Saver",
      description: "Reduce 🚗 transport cost today by 15%",
      category: "transport",
      frequency: "daily",
      targetReduction: 15,
      badge: "🛴 Minimal Mover",
      isCompleted: false,
      progress: 0,
    },
    {
      id: "3",
      title: "Entertainment Monthly Cut",
      description: "Cut 🎮 entertainment by 20% this month",
      category: "entertainment",
      frequency: "monthly",
      targetReduction: 20,
      badge: "🎓 Smart Fun",
      isCompleted: false,
      progress: 0,
    },
  ]);

  const texts = {
    uz: {
      title: "Tejash challenji",
      completed: "Bajarildi",
      inProgress: "Jarayonda",
    },
    ru: {
      title: "Вызов экономии",
      completed: "Завершено",
      inProgress: "В процессе",
    },
    en: {
      title: "Savings Challenge",
      completed: "Completed",
      inProgress: "In Progress",
    },
  };

  const t = texts[language];

  useEffect(() => {
    const now = new Date();

    // Helper function: filter by date range
    const filterExpenses = (from: Date, to: Date, category: string) => {
      return expenses
        .filter(
          (e) =>
            new Date(e.date) >= from &&
            new Date(e.date) < to &&
            e.category === category
        )
        .reduce((sum, e) => sum + e.amount, 0);
    };

    setChallenges((prev) =>
      prev.map((challenge) => {
        const today = new Date(now.toDateString());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(now.getDate() - 14);

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

        let current = 0;
        let previous = 0;

        if (challenge.frequency === "daily") {
          current = filterExpenses(today, now, challenge.category);
          previous = filterExpenses(yesterday, today, challenge.category);
        } else if (challenge.frequency === "weekly") {
          current = filterExpenses(weekStart, now, challenge.category);
          previous = filterExpenses(twoWeeksAgo, weekStart, challenge.category);
        } else if (challenge.frequency === "monthly") {
          current = filterExpenses(monthStart, now, challenge.category);
          previous = filterExpenses(
            lastMonthStart,
            lastMonthEnd,
            challenge.category
          );
        }

        if (previous === 0) return challenge;

        const reduction = ((previous - current) / previous) * 100;
        const progress = Math.min(
          (reduction / challenge.targetReduction) * 100,
          100
        );
        const isCompleted = progress >= 100;

        if (isCompleted && !challenge.isCompleted) {
          onBadgeEarned(challenge.badge);
        }

        return {
          ...challenge,
          progress,
          isCompleted,
        };
      })
    );
  }, [expenses, onBadgeEarned]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{challenge.description}</div>
              <Badge variant={challenge.isCompleted ? "default" : "secondary"}>
                {challenge.isCompleted ? t.completed : t.inProgress}
              </Badge>
            </div>

            <Progress value={challenge.progress} className="mb-2" />

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {Math.round(challenge.progress)}% / {challenge.targetReduction}%
              </span>
              {challenge.isCompleted && (
                <div className="flex items-center gap-1 text-green-600">
                  <Award className="h-4 w-4" />
                  <span>{challenge.badge}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
