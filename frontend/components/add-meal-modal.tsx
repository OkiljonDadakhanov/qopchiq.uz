"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Meal {
  name: string
  calories: number
  emoji: string
  date: string
  category: "protein" | "carbs" | "veggies" | "sweets"
}

interface AddMealModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (meal: Meal) => void
  language: "uz" | "ru" | "en"
}

// Expanded Uzbek Foods Database
const uzbekFoods = [
  { name: "Osh", emoji: "🍚", calories: 350, category: "carbs" as const },
  { name: "Somsa", emoji: "🥟", calories: 280, category: "carbs" as const },
  { name: "Shashlik", emoji: "🍗", calories: 320, category: "protein" as const },
  { name: "Lagman", emoji: "🍜", calories: 400, category: "carbs" as const },
  { name: "Manti", emoji: "🥟", calories: 250, category: "carbs" as const },
  { name: "Non", emoji: "🍞", calories: 150, category: "carbs" as const },
  { name: "Beshbarmaq", emoji: "🍝", calories: 450, category: "carbs" as const },
  { name: "Dimlama", emoji: "🍲", calories: 300, category: "veggies" as const },
  { name: "Qozon kabob", emoji: "🥘", calories: 380, category: "protein" as const },
  { name: "Mastava", emoji: "🍲", calories: 220, category: "carbs" as const },
  { name: "Chuchvara", emoji: "🥟", calories: 180, category: "carbs" as const },
  { name: "Norin", emoji: "🍜", calories: 320, category: "carbs" as const },
  { name: "Qovurma", emoji: "🍖", calories: 420, category: "protein" as const },
  { name: "Tandir kabob", emoji: "🍗", calories: 350, category: "protein" as const },
  { name: "Halva", emoji: "🍯", calories: 200, category: "sweets" as const },
  { name: "Chak-chak", emoji: "🍯", calories: 180, category: "sweets" as const },
  { name: "Sumalak", emoji: "🥣", calories: 120, category: "sweets" as const },
]

const commonFoods = [
  { name: "Apple", emoji: "🍎", calories: 80, category: "veggies" as const },
  { name: "Banana", emoji: "🍌", calories: 105, category: "veggies" as const },
  { name: "Chicken", emoji: "🍗", calories: 200, category: "protein" as const },
  { name: "Rice", emoji: "🍚", calories: 130, category: "carbs" as const },
  { name: "Salad", emoji: "🥗", calories: 50, category: "veggies" as const },
  { name: "Chocolate", emoji: "🍫", calories: 150, category: "sweets" as const },
  { name: "Bread", emoji: "🍞", calories: 120, category: "carbs" as const },
  { name: "Egg", emoji: "🥚", calories: 70, category: "protein" as const },
  { name: "Milk", emoji: "🥛", calories: 60, category: "protein" as const },
  { name: "Yogurt", emoji: "🥛", calories: 80, category: "protein" as const },
]

export function AddMealModal({ isOpen, onClose, onAdd, language }: AddMealModalProps) {
  const [customName, setCustomName] = useState("")
  const [customCalories, setCustomCalories] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"protein" | "carbs" | "veggies" | "sweets">("protein")
  const [searchTerm, setSearchTerm] = useState("")

  const texts = {
    uz: {
      title: "Ovqat qo'shish",
      uzbekFoods: "O'zbek taomlari",
      commonFoods: "Oddiy taomlar",
      customFood: "Boshqa taom",
      foodName: "Taom nomi",
      calories: "Kaloriya",
      category: "Kategoriya",
      add: "Qo'shish",
      cancel: "Bekor qilish",
      protein: "Oqsil",
      carbs: "Uglevod",
      veggies: "Sabzavot",
      sweets: "Shirinlik",
      search: "Qidirish",
      healthyAlternative: "Sog'lom alternativa",
      suggestion: "Tavsiya",
      description: "Taomni tanlang yoki o'zingizning taomingizni qo'shing",
    },
    ru: {
      title: "Добавить еду",
      uzbekFoods: "Узбекские блюда",
      commonFoods: "Обычная еда",
      customFood: "Другая еда",
      foodName: "Название блюда",
      calories: "Калории",
      category: "Категория",
      add: "Добавить",
      cancel: "Отмена",
      protein: "Белки",
      carbs: "Углеводы",
      veggies: "Овощи",
      sweets: "Сладости",
      search: "Поиск",
      healthyAlternative: "Здоровая альтернатива",
      suggestion: "Предложение",
      description: "Выберите еду или добавьте свою",
    },
    en: {
      title: "Add Meal",
      uzbekFoods: "Uzbek Foods",
      commonFoods: "Common Foods",
      customFood: "Custom Food",
      foodName: "Food Name",
      calories: "Calories",
      category: "Category",
      add: "Add",
      cancel: "Cancel",
      protein: "Protein",
      carbs: "Carbs",
      veggies: "Veggies",
      sweets: "Sweets",
      search: "Search",
      healthyAlternative: "Healthy Alternative",
      suggestion: "Suggestion",
      description: "Select a meal or add custom food",
    },
  }

  const t = texts[language]

  const filteredUzbekFoods = uzbekFoods.filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredCommonFoods = commonFoods.filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getHealthySuggestion = (food: (typeof uzbekFoods)[0]) => {
    const suggestions = {
      uz: {
        Osh: "Sabzavotli osh yoki kam yog'li osh tayyorlang",
        Somsa: "Pishirilgan somsa yoki sabzavotli somsa tanlang",
        Shashlik: "Tovuq go'shti yoki baliq shashlik tanlang",
        Halva: "Meva yoki yong'oq bilan almashtiring",
      },
      ru: {
        Osh: "Приготовьте плов с овощами или с меньшим количеством масла",
        Somsa: "Выберите запеченную самсу или с овощами",
        Shashlik: "Выберите шашлык из курицы или рыбы",
        Halva: "Замените фруктами или орехами",
      },
      en: {
        Osh: "Make vegetable pilaf or use less oil",
        Somsa: "Choose baked samsa or vegetable samsa",
        Shashlik: "Choose chicken or fish shashlik",
        Halva: "Replace with fruits or nuts",
      },
    }

    return suggestions[language]?.[food.name] || ""
  }

  const handleFoodSelect = (food: (typeof uzbekFoods)[0]) => {
    onAdd({
      name: food.name,
      calories: food.calories,
      emoji: food.emoji,
      date: new Date().toISOString(),
      category: food.category,
    })
    onClose()
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName || !customCalories) return

    const categoryEmojis = {
      protein: "🍗",
      carbs: "🍞",
      veggies: "🥗",
      sweets: "🍫",
    }

    onAdd({
      name: customName,
      calories: Number.parseInt(customCalories),
      emoji: categoryEmojis[selectedCategory],
      date: new Date().toISOString(),
      category: selectedCategory,
    })

    setCustomName("")
    setCustomCalories("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">{t.title}</DialogTitle>
          <DialogDescription>{t.description || "Select a meal or add custom food"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div>
            <Input
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-3"
            />
          </div>

          {/* Uzbek Foods */}
          <div>
            <h3 className="font-medium mb-2">{t.uzbekFoods}</h3>
            <div className="grid grid-cols-2 gap-2">
              {filteredUzbekFoods.map((food) => {
                const suggestion = getHealthySuggestion(food)
                return (
                  <div key={food.name} className="relative">
                    <Button
                      variant="outline"
                      className="h-20 w-full flex flex-col gap-1 bg-transparent relative"
                      onClick={() => handleFoodSelect(food)}
                    >
                      <span className="text-xl">{food.emoji}</span>
                      <span className="text-xs">{food.name}</span>
                      <span className="text-xs text-gray-500">{food.calories} kcal</span>
                      {food.calories > 300 && (
                        <div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                          title={suggestion}
                        />
                      )}
                    </Button>
                    {suggestion && food.calories > 300 && (
                      <div className="text-xs text-yellow-600 mt-1 p-1 bg-yellow-50 rounded">💡 {suggestion}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Common Foods */}
          <div>
            <h3 className="font-medium mb-2">{t.commonFoods}</h3>
            <div className="grid grid-cols-2 gap-2">
              {filteredCommonFoods.map((food) => (
                <Button
                  key={food.name}
                  variant="outline"
                  className="h-16 flex flex-col gap-1 bg-transparent"
                  onClick={() => handleFoodSelect(food)}
                >
                  <span className="text-xl">{food.emoji}</span>
                  <span className="text-xs">{food.name}</span>
                  <span className="text-xs text-gray-500">{food.calories} kcal</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Food */}
          <div>
            <h3 className="font-medium mb-2">{t.customFood}</h3>
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <Label htmlFor="foodName">{t.foodName}</Label>
                <Input
                  id="foodName"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Taom nomi"
                />
              </div>

              <div>
                <Label htmlFor="calories">{t.calories}</Label>
                <Input
                  id="calories"
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  placeholder="250"
                />
              </div>

              <div>
                <Label>{t.category}</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {(["protein", "carbs", "veggies", "sweets"] as const).map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={selectedCategory === cat ? "default" : "outline"}
                      className="h-12 flex flex-col gap-1"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span className="text-lg">
                        {cat === "protein" && "🍗"}
                        {cat === "carbs" && "🍞"}
                        {cat === "veggies" && "🥗"}
                        {cat === "sweets" && "🍫"}
                      </span>
                      <span className="text-xs">{t[cat]}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  {t.cancel}
                </Button>
                <Button type="submit" className="flex-1">
                  {t.add}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
