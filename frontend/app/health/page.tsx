"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { HealthStats } from "@/components/health-stats";
import { HealthChallenges } from "@/components/health-challenges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ExternalLink } from "lucide-react";

interface Meal {
  id: string;
  name: string;
  calories: number;
  emoji: string;
  date: string;
  category: "protein" | "carbs" | "veggies" | "sweets";
}

interface UserData {
  monthlyLimit: number;
  currentBalance: number;
  level: number;
  coins: number;
  streak: number;
  badges: string[];
}

interface Recipe {
  title: string;
  link: string;
}

export default function HealthPage() {
  const [language, setLanguage] = useState<"uz" | "ru" | "en">("uz");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [userData, setUserData] = useState<UserData>({
    monthlyLimit: 1000000,
    currentBalance: 500000,
    level: 1,
    coins: 0,
    streak: 0,
    badges: [],
  });

  useEffect(() => {
    const savedLanguage = localStorage.getItem("qopchiq-language");
    const savedMeals = localStorage.getItem("qopchiq-meals");
    const savedUserData = localStorage.getItem("qopchiq-userdata");

    if (savedLanguage) setLanguage(savedLanguage as "uz" | "ru" | "en");
    if (savedMeals) setMeals(JSON.parse(savedMeals));
    if (savedUserData) setUserData(JSON.parse(savedUserData));
  }, []);

  const texts = {
    uz: {
      title: "Sog'liq va turmush tarzi",
      cookingTutorials: "Oson va sog'lom taom tayyorlash",
      tutorialDesc: "Sog'lom ovqatlanish uchun retseptlar va maslahatlar",
      viewTutorials: "Retseptlar",
    },
    ru: {
      title: "Здоровье и образ жизни",
      cookingTutorials: "Простые и здоровые кулинарные уроки",
      tutorialDesc: "Рецепты и советы для здорового питания",
      viewTutorials: "Рецепты",
    },
    en: {
      title: "Health & Lifestyle",
      cookingTutorials: "Easy and Healthy Cooking Tutorials",
      tutorialDesc: "Recipes and tips for healthy eating",
      viewTutorials: "Recipes",
    },
  };

  const recipes: Record<"uz" | "ru" | "en", Recipe[]> = {
    uz: [
      {
        title: "Bodring salati",
        link: "https://youtu.be/dQw4w9WgXcQ?list=RDdQw4w9WgXcQ",
      },
      {
        title: "Pishloqli nonushta",
        link: "https://youtu.be/dQw4w9WgXcQ?list=RDdQw4w9WgXcQ",
      },
    ],
    ru: [
      { title: "Салат из огурцов", link: "https://example.com/ru/salat" },
      { title: "Завтрак с творогом", link: "https://example.com/ru/zavtrak" },
    ],
    en: [
      {
        title: "Cucumber Salad",
        link: "https://example.com/en/cucumber-salad",
      },
      {
        title: "Protein Breakfast Bowl",
        link: "https://example.com/en/breakfast",
      },
    ],
  };

  const t = texts[language];
  const tutorialList = recipes[language];

  const todayMeals = meals.filter(
    (meal) => new Date(meal.date).toDateString() === new Date().toDateString()
  );

  const handleCoinsEarned = (coins: number) => {
    const updated = {
      ...userData,
      coins: userData.coins + coins,
      level: Math.floor((userData.coins + coins) / 100) + 1,
    };
    setUserData(updated);
    localStorage.setItem("qopchiq-userdata", JSON.stringify(updated));
  };

  const handleTutorialClick = (recipe: Recipe) => {
    handleCoinsEarned(2); // +2 coins for viewing
    window.open(recipe.link, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span>❤️‍🩹</span>
            {t.title}
          </h1>
        </div>

        {/* Health Stats */}
        <HealthStats meals={todayMeals} language={language} />

        {/* Health Challenges */}
        <HealthChallenges
          language={language}
          onCoinsEarned={handleCoinsEarned}
          streak={userData.streak}
        />

        {/* Dynamic Cooking Tutorials */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              {t.cookingTutorials}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">{t.tutorialDesc}</p>

            {tutorialList.map((recipe) => (
              <Button
                key={recipe.link}
                variant="outline"
                className="w-full flex justify-between items-center"
                onClick={() => handleTutorialClick(recipe)}
              >
                <span>{recipe.title}</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            ))}

            <div className="text-xs text-gray-500 text-center italic">
              (+2 Qopchiq Coins for each recipe view)
            </div>
          </CardContent>
        </Card>
      </div>

      <Navigation language={language} />
    </div>
  );
}
