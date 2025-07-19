"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HealthChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  unit: string;
  currentProgress: number;
  rewardCoins: number;
  isCompleted: boolean;
  lastUpdated: string;
}

interface HealthChallengesProps {
  language: "uz" | "ru" | "en";
  onCoinsEarned: (coins: number) => void;
  streak: number;
}

export function HealthChallenges({
  language,
  onCoinsEarned,
  streak,
}: HealthChallengesProps) {
  const [challenges, setChallenges] = useState<HealthChallenge[]>([]);

  const texts = {
    uz: {
      title: "Sog'liq musobaqalari",
      completed: "Bajarildi",
      inProgress: "Jarayonda",
      reward: "mukofot",
      markDone: "Bajarildi deb belgilash",
      reset: "Qayta boshlash",
      days: "kun",
      steps: "qadam",
      minutes: "daq",
    },
    ru: {
      title: "Вызовы здоровья",
      completed: "Завершено",
      inProgress: "В процессе",
      reward: "награда",
      markDone: "Отметить как выполненное",
      reset: "Сбросить",
      days: "дней",
      steps: "шагов",
      minutes: "мин",
    },
    en: {
      title: "Health Challenges",
      completed: "Completed",
      inProgress: "In Progress",
      reward: "reward",
      markDone: "Mark as Done",
      reset: "Reset",
      days: "days",
      steps: "steps",
      minutes: "mins",
    },
  };

  const t = texts[language];

  const defaultChallenges: HealthChallenge[] = [
    {
      id: "sugar-free",
      title: "7-day Sugar-Free Challenge",
      description: "Avoid added sugars for 7 days",
      target: 7,
      unit: "days",
      currentProgress: 0,
      rewardCoins: 100,
      isCompleted: false,
      lastUpdated: "",
    },
    {
      id: "10k-steps",
      title: "10k Steps Streak",
      description: "Achieve 10,000 steps daily for 5 days",
      target: 5,
      unit: "days",
      currentProgress: streak,
      rewardCoins: 150,
      isCompleted: false,
      lastUpdated: "",
    },
    {
      id: "water-challenge",
      title: "8 Glasses of Water Daily",
      description: "Drink 8 glasses of water for 3 days",
      target: 3,
      unit: "days",
      currentProgress: 0,
      rewardCoins: 50,
      isCompleted: false,
      lastUpdated: "",
    },
    {
      id: "meditation",
      title: "5-min Daily Meditation",
      description: "Practice 5 minutes of meditation for 5 days",
      target: 5,
      unit: "days",
      currentProgress: 0,
      rewardCoins: 70,
      isCompleted: false,
      lastUpdated: "",
    },
    {
      id: "healthy-meal",
      title: "Healthy Meal Tracker",
      description: "Eat at least 1 healthy meal a day for 4 days",
      target: 4,
      unit: "days",
      currentProgress: 0,
      rewardCoins: 80,
      isCompleted: false,
      lastUpdated: "",
    },
  ];

  // Load and initialize
  useEffect(() => {
    const saved = localStorage.getItem("qopchiq-health-challenges");
    if (saved) {
      setChallenges(JSON.parse(saved));
    } else {
      const initialized = defaultChallenges.map((c) => ({
        ...c,
        lastUpdated: "",
      }));
      setChallenges(initialized);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(
      "qopchiq-health-challenges",
      JSON.stringify(challenges)
    );
  }, [challenges]);

  // Auto-track streak-based challenge
  useEffect(() => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === "10k-steps" && !c.isCompleted) {
          const done = streak >= c.target;
          if (done && !c.isCompleted) onCoinsEarned(c.rewardCoins);
          return { ...c, currentProgress: streak, isCompleted: done };
        }
        return c;
      })
    );
  }, [streak]);

  const markDone = (id: string) => {
    const today = new Date().toDateString();

    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id && !c.isCompleted && c.lastUpdated !== today) {
          const updatedProgress = c.currentProgress + 1;
          const completed = updatedProgress >= c.target;

          if (completed && !c.isCompleted) onCoinsEarned(c.rewardCoins);

          return {
            ...c,
            currentProgress: updatedProgress,
            isCompleted: completed,
            lastUpdated: today,
          };
        }
        return c;
      })
    );
  };

  const resetChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              currentProgress: 0,
              isCompleted: false,
              lastUpdated: "",
            }
          : c
      )
    );
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <HeartPulse className="h-5 w-5" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((c) => {
          const percent = (c.currentProgress / c.target) * 100;
          const lastDone = c.lastUpdated
            ? new Date(c.lastUpdated).toLocaleDateString()
            : "-";

          return (
            <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium">{c.title}</div>
                <Badge variant={c.isCompleted ? "default" : "secondary"}>
                  {c.isCompleted ? t.completed : t.inProgress}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{c.description}</p>
              <Progress value={percent} className="my-2" />

              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  {c.currentProgress}/{c.target} {t[c.unit as keyof typeof t]}
                </span>
                <span className="text-yellow-600">
                  {c.rewardCoins} Qopchiq Coins
                </span>
              </div>

              <div className="text-xs text-gray-400 mb-2">Last: {lastDone}</div>

              <div className="flex gap-2">
                {!c.isCompleted && c.id !== "10k-steps" && (
                  <Button
                    onClick={() => markDone(c.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {t.markDone}
                  </Button>
                )}
                {c.isCompleted && (
                  <Button
                    onClick={() => resetChallenge(c.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {t.reset}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
