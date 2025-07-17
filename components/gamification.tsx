"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Award, Star, Zap } from "lucide-react"

interface UserData {
  monthlyLimit: number
  currentBalance: number
  level: number
  points: number
  streak: number
  badges: string[]
}

interface GamificationProps {
  userData: UserData
  language: "uz" | "ru" | "en"
}

export function Gamification({ userData, language }: GamificationProps) {
  const texts = {
    uz: {
      level: "Daraja",
      points: "Ball",
      streak: "Ketma-ketlik",
      badges: "Nishonlar",
      days: "kun",
      nextLevel: "Keyingi daraja",
      pointsToNext: "ball kerak",
    },
    ru: {
      level: "Уровень",
      points: "Очки",
      streak: "Серия",
      badges: "Значки",
      days: "дней",
      nextLevel: "Следующий уровень",
      pointsToNext: "очков нужно",
    },
    en: {
      level: "Level",
      points: "Points",
      streak: "Streak",
      badges: "Badges",
      days: "days",
      nextLevel: "Next Level",
      pointsToNext: "points needed",
    },
  }

  const t = texts[language]

  const pointsForNextLevel = userData.level * 100 - (userData.points % (userData.level * 100))
  const progressToNextLevel = ((userData.points % (userData.level * 100)) / (userData.level * 100)) * 100

  return (
    <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{t.level}</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{userData.level}</div>
            <Progress value={progressToNextLevel} className="h-1 mt-2" />
            <div className="text-xs text-gray-600 mt-1">
              {pointsForNextLevel} {t.pointsToNext}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{t.points}</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{userData.points}</div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-sm">🔥</span>
              <span className="text-sm font-medium">{t.streak}</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{userData.streak}</div>
            <div className="text-xs text-gray-600">{t.days}</div>
          </div>
        </div>

        {userData.badges.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{t.badges}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {userData.badges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
