"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertTriangle, TrendingUp } from "lucide-react"

interface SpendingLimitProps {
  monthlySpent: number
  monthlyLimit: number
  language: "uz" | "ru" | "en"
  onUpdateLimit: (newLimit: number) => void
}

export function SpendingLimit({ monthlySpent, monthlyLimit, language, onUpdateLimit }: SpendingLimitProps) {
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [newLimit, setNewLimit] = useState(monthlyLimit.toString())

  const texts = {
    uz: {
      monthlyBudget: "Oylik byudjet",
      spent: "sarflangan",
      remaining: "qolgan",
      setLimit: "Limit o'rnatish",
      updateLimit: "Limitni yangilash",
      newLimit: "Yangi limit",
      save: "Saqlash",
      cancel: "Bekor qilish",
      warning: "Ogohlantirish!",
      exceeded: "Oylik limitdan oshib ketdi!",
      nearLimit: "Limitga yaqinlashyapti",
    },
    ru: {
      monthlyBudget: "Месячный бюджет",
      spent: "потрачено",
      remaining: "осталось",
      setLimit: "Установить лимит",
      updateLimit: "Обновить лимит",
      newLimit: "Новый лимит",
      save: "Сохранить",
      cancel: "Отмена",
      warning: "Предупреждение!",
      exceeded: "Превышен месячный лимит!",
      nearLimit: "Приближается к лимиту",
    },
    en: {
      monthlyBudget: "Monthly Budget",
      spent: "spent",
      remaining: "remaining",
      setLimit: "Set Limit",
      updateLimit: "Update Limit",
      newLimit: "New Limit",
      save: "Save",
      cancel: "Cancel",
      warning: "Warning!",
      exceeded: "Monthly limit exceeded!",
      nearLimit: "Approaching limit",
    },
  }

  const t = texts[language]
  const percentage = (monthlySpent / monthlyLimit) * 100
  const remaining = monthlyLimit - monthlySpent
  const isExceeded = monthlySpent > monthlyLimit
  const isNearLimit = percentage > 80

  const handleUpdateLimit = () => {
    const limit = Number.parseFloat(newLimit)
    if (limit > 0) {
      onUpdateLimit(limit)
      setShowLimitModal(false)
    }
  }

  return (
    <>
      <Card
        className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg ${isExceeded ? "ring-2 ring-red-500" : isNearLimit ? "ring-2 ring-yellow-500" : ""}`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t.monthlyBudget}
            {isExceeded && <AlertTriangle className="h-5 w-5 text-red-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isExceeded && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">{t.warning}</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{t.exceeded}</p>
            </div>
          )}

          {isNearLimit && !isExceeded && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">{t.nearLimit}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {monthlySpent.toLocaleString()} so'm {t.spent}
              </span>
              <span className={remaining >= 0 ? "text-green-600" : "text-red-600"}>
                {Math.abs(remaining).toLocaleString()} so'm {remaining >= 0 ? t.remaining : "oshiq"}
              </span>
            </div>
            <Progress
              value={Math.min(percentage, 100)}
              className={`h-3 ${isExceeded ? "[&>div]:bg-red-500" : isNearLimit ? "[&>div]:bg-yellow-500" : ""}`}
            />
            <div className="text-center text-sm text-gray-600">{monthlyLimit.toLocaleString()} so'm limit</div>
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowLimitModal(true)} className="w-full">
            {t.setLimit}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{t.updateLimit}</DialogTitle>
            <DialogDescription>Set your monthly spending limit to track your budget</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.newLimit} (so'm)</label>
              <Input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="1000000"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowLimitModal(false)} className="flex-1">
                {t.cancel}
              </Button>
              <Button onClick={handleUpdateLimit} className="flex-1">
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
