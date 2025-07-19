"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface Expense {
  amount: number;
  category: string;
  emoji: string;
  description: string;
  date: string;
  mood?: string;
  location?: string; // Added location field
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Expense) => void;
  language: "uz" | "ru" | "en";
  currentBalance: number;
  monthlySpent: number;
  monthlyLimit: number;
}

const expenseCategories = [
  { emoji: "🍕", category: "food", uz: "Ovqat", ru: "Еда", en: "Food" },
  {
    emoji: "🚗",
    category: "transport",
    uz: "Transport",
    ru: "Транспорт",
    en: "Transport",
  },
  { emoji: "🏠", category: "home", uz: "Uy", ru: "Дом", en: "Home" },
  {
    emoji: "👕",
    category: "clothes",
    uz: "Kiyim",
    ru: "Одежда",
    en: "Clothes",
  },
  {
    emoji: "🎮",
    category: "entertainment",
    uz: "O'yin-kulgi",
    ru: "Развлечения",
    en: "Entertainment",
  },
  {
    emoji: "💊",
    category: "health",
    uz: "Sog'liq",
    ru: "Здоровье",
    en: "Health",
  },
  {
    emoji: "📚",
    category: "education",
    uz: "Ta'lim",
    ru: "Образование",
    en: "Education",
  },
  { emoji: "💰", category: "other", uz: "Boshqa", ru: "Другое", en: "Other" },
];

const moods = [
  { emoji: "😊", mood: "happy", uz: "Xursand", ru: "Счастливый", en: "Happy" },
  {
    emoji: "😐",
    mood: "neutral",
    uz: "Oddiy",
    ru: "Нейтральный",
    en: "Neutral",
  },
  { emoji: "😔", mood: "sad", uz: "G'amgin", ru: "Грустный", en: "Sad" },
  { emoji: "😤", mood: "stressed", uz: "Stress", ru: "Стресс", en: "Stressed" },
];

export function AddExpenseModal({
  isOpen,
  onClose,
  onAdd,
  language,
  currentBalance,
  monthlySpent,
  monthlyLimit,
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    expenseCategories[0]
  );
  const [selectedMood, setSelectedMood] = useState(moods[0]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(""); // New state for location

  const texts = {
    uz: {
      title: "Xarajat qo'shish",
      amount: "Miqdor (so'm)",
      category: "Kategoriya",
      mood: "Kayfiyat",
      description: "Xarajat tafsilotlarini quyida kiriting",
      location: "Joylashuv (ixtiyoriy)",
      add: "Qo'shish",
      cancel: "Bekor qilish",
      warning: "Ogohlantirish!",
      exceedsBalance: "Joriy balansdan oshib ketadi",
      exceedsLimit: "Oylik limitdan oshib ketadi",
      currentBalance: "Joriy balans",
      monthlyRemaining: "Oylik qolgan",
    },
    ru: {
      title: "Добавить расход",
      amount: "Сумма (сум)",
      category: "Категория",
      mood: "Настроение",
      description: "Добавьте детали своего расхода ниже",
      location: "Местоположение (необязательно)",
      add: "Добавить",
      cancel: "Отмена",
      warning: "Предупреждение!",
      exceedsBalance: "Превышает текущий баланс",
      exceedsLimit: "Превышает месячный лимит",
      currentBalance: "Текущий баланс",
      monthlyRemaining: "Осталось в месяце",
    },
    en: {
      title: "Add Expense",
      amount: "Amount (UZS)",
      category: "Category",
      mood: "Mood",
      description: "Add your expense details below",
      location: "Location (optional)",
      add: "Add",
      cancel: "Cancel",
      warning: "Warning!",
      exceedsBalance: "Exceeds current balance",
      exceedsLimit: "Exceeds monthly limit",
      currentBalance: "Current Balance",
      monthlyRemaining: "Monthly Remaining",
    },
  };

  const t = texts[language];

  const expenseAmount = Number.parseFloat(amount) || 0;
  const exceedsBalance = expenseAmount > currentBalance;
  const exceedsLimit = monthlySpent + expenseAmount > monthlyLimit;
  const monthlyRemaining = monthlyLimit - monthlySpent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number.parseFloat(amount) <= 0) return;

    onAdd({
      amount: Number.parseFloat(amount),
      category: selectedCategory.category,
      emoji: selectedCategory.emoji,
      description,
      date: new Date().toISOString(),
      mood: selectedMood.mood,
      location, // Include location
    });

    // Reset form
    setAmount("");
    setDescription("");
    setLocation(""); // Reset location
    setSelectedCategory(expenseCategories[0]);
    setSelectedMood(moods[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">{t.title}</DialogTitle>
          <DialogDescription>
            {t.description || "Add your expense details below"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">{t.amount}</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
              required
              className={exceedsBalance || exceedsLimit ? "border-red-500" : ""}
            />

            {/* Balance and Limit Warnings */}
            {(exceedsBalance || exceedsLimit) && (
              <div className="mt-2 space-y-1">
                {exceedsBalance && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{t.exceedsBalance}</span>
                  </div>
                )}
                {exceedsLimit && (
                  <div className="flex items-center gap-2 text-orange-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{t.exceedsLimit}</span>
                  </div>
                )}
              </div>
            )}

            {/* Balance Info */}
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <div>
                {t.currentBalance}: {currentBalance.toLocaleString()} so'm
              </div>
              <div>
                {t.monthlyRemaining}: {monthlyRemaining.toLocaleString()} so'm
              </div>
            </div>
          </div>

          <div>
            <Label>{t.category}</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {expenseCategories.map((cat) => (
                <Button
                  key={cat.category}
                  type="button"
                  variant={
                    selectedCategory.category === cat.category
                      ? "default"
                      : "outline"
                  }
                  className="h-16 flex flex-col gap-1"
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-xs">{cat[language]}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>{t.mood}</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {moods.map((mood) => (
                <Button
                  key={mood.mood}
                  type="button"
                  variant={
                    selectedMood.mood === mood.mood ? "default" : "outline"
                  }
                  className="h-12 flex flex-col gap-1"
                  onClick={() => setSelectedMood(mood)}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span className="text-xs">{mood[language]}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nima uchun xarajat qildingiz?"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="location">{t.location}</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Masalan: Supermarket, Kafe"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              {t.cancel}
            </Button>
            <Button type="submit" className="flex-1" disabled={exceedsBalance}>
              {t.add}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
