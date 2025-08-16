"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Target, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: string;
  isCompleted: boolean;
}

interface GoalSetterProps {
  language: "uz" | "ru" | "en";
  expenses: { amount: number; date: string }[]; // To calculate savings
}

export function GoalSetter({ language, expenses }: GoalSetterProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    dueDate: "",
  });

  useEffect(() => {
    const savedGoals = localStorage.getItem("qopchiq-goals");
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);

  useEffect(() => {
    localStorage.setItem("qopchiq-goals", JSON.stringify(goals));
  }, [goals]);

  const texts = {
    uz: {
      title: "Maqsadlarim",
      addGoal: "Maqsad qo'shish",
      goalName: "Maqsad nomi",
      targetAmount: "Maqsad miqdori (so'm)",
      dueDate: "Maqsad sanasi",
      save: "Saqlash",
      cancel: "Bekor qilish",
      noGoals: "Hech qanday maqsad yo'q",
      progress: "Jarayon",
      completed: "Bajarildi",
      remaining: "qolgan",
      achieved: "Erishildi!",
      setGoalDesc: "Yangi moliyaviy maqsad qo'shing",
    },
    ru: {
      title: "Мои цели",
      addGoal: "Добавить цель",
      goalName: "Название цели",
      targetAmount: "Целевая сумма (сум)",
      dueDate: "Дата цели",
      save: "Сохранить",
      cancel: "Отмена",
      noGoals: "Нет целей",
      progress: "Прогресс",
      completed: "Завершено",
      remaining: "осталось",
      achieved: "Достигнуто!",
      setGoalDesc: "Добавьте новую финансовую цель",
    },
    en: {
      title: "My Goals",
      addGoal: "Add Goal",
      goalName: "Goal Name",
      targetAmount: "Target Amount (UZS)",
      dueDate: "Target Date",
      save: "Save",
      cancel: "Cancel",
      noGoals: "No goals set",
      progress: "Progress",
      completed: "Completed",
      remaining: "remaining",
      achieved: "Achieved!",
      setGoalDesc: "Add a new financial goal",
    },
  };

  const t = texts[language];

  const addGoal = () => {
    if (newGoal.name && newGoal.targetAmount && newGoal.dueDate) {
      const goal: Goal = {
        id: Date.now().toString(),
        name: newGoal.name,
        targetAmount: Number.parseFloat(newGoal.targetAmount),
        currentAmount: 0, // Will be updated by savings
        dueDate: newGoal.dueDate,
        isCompleted: false,
      };
      setGoals((prev) => [...prev, goal]);
      setNewGoal({ name: "", targetAmount: "", dueDate: "" });
      setShowAddModal(false);
    }
  };

  // This is a simplified way to track progress.
  // In a real app, you'd need to track income/savings explicitly.
  // For now, let's assume a fixed daily saving or link to overall budget.
  // For demonstration, let's just make it manually adjustable or based on a simple heuristic.
  // For now, I'll make it manually adjustable for simplicity.
  const updateGoalProgress = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === id) {
          const newCurrent = Math.min(
            goal.currentAmount + amount,
            goal.targetAmount
          );
          return {
            ...goal,
            currentAmount: newCurrent,
            isCompleted: newCurrent >= goal.targetAmount,
          };
        }
        return goal;
      })
    );
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t.title}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <div className="text-4xl mb-2">🎯</div>
              <p>{t.noGoals}</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progressPercentage =
                (goal.currentAmount / goal.targetAmount) * 100;
              const remainingAmount = goal.targetAmount - goal.currentAmount;
              return (
                <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{goal.name}</div>
                    <Badge variant={goal.isCompleted ? "default" : "secondary"}>
                      {goal.isCompleted ? t.completed : t.progress}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {goal.currentAmount.toLocaleString()} /{" "}
                    {goal.targetAmount.toLocaleString()} so'm
                  </div>
                  <Progress value={progressPercentage} className="mb-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {goal.isCompleted
                        ? t.achieved
                        : `${remainingAmount.toLocaleString()} so'm ${
                            t.remaining
                          }`}
                    </span>
                    <span>
                      {new Date(goal.dueDate).toLocaleDateString(
                        language === "uz" ? "uz-UZ" : undefined
                      )}
                    </span>
                  </div>
                  {!goal.isCompleted && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateGoalProgress(goal.id, 10000)}
                        className="flex-1"
                      >
                        +10,000 so'm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateGoalProgress(goal.id, 50000)}
                        className="flex-1"
                      >
                        +50,000 so'm
                      </Button>
                    </div>
                  )}
                  {goal.isCompleted && (
                    <div className="mt-3 text-center text-green-600 font-medium flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4" /> {t.achieved}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{t.addGoal}</DialogTitle>
            <DialogDescription>{t.setGoalDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goalName">{t.goalName}</Label>
              <Input
                id="goalName"
                value={newGoal.name}
                onChange={(e) =>
                  setNewGoal((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Yangi telefon, Mashina uchun"
              />
            </div>
            <div>
              <Label htmlFor="targetAmount">{t.targetAmount}</Label>
              <Input
                id="targetAmount"
                type="number"
                value={newGoal.targetAmount}
                onChange={(e) =>
                  setNewGoal((prev) => ({
                    ...prev,
                    targetAmount: e.target.value,
                  }))
                }
                placeholder="5000000"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">{t.dueDate}</Label>
              <Input
                id="dueDate"
                type="date"
                value={newGoal.dueDate}
                onChange={(e) =>
                  setNewGoal((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              >
                {t.cancel}
              </Button>
              <Button onClick={addGoal} className="flex-1">
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
