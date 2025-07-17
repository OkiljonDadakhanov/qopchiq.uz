"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Bill {
  id: string
  name: string
  emoji: string
  amount: number
  dueDate: string
  isPaid: boolean
}

interface BillRemindersProps {
  language: "uz" | "ru" | "en"
}

const defaultBills = [
  { id: "1", name: "Elektr energiya", emoji: "💡", amount: 150000, dueDate: "2024-01-15", isPaid: false },
  { id: "2", name: "Internet", emoji: "🌐", amount: 80000, dueDate: "2024-01-20", isPaid: false },
  { id: "3", name: "Gaz", emoji: "🔥", amount: 120000, dueDate: "2024-01-25", isPaid: true },
]

export function BillReminders({ language }: BillRemindersProps) {
  const [bills, setBills] = useState<Bill[]>(defaultBills)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBill, setNewBill] = useState({ name: "", emoji: "💡", amount: "", dueDate: "" })

  const texts = {
    uz: {
      title: "Hisob-kitob eslatmalari",
      addBill: "Hisob qo'shish",
      paid: "To'langan",
      unpaid: "To'lanmagan",
      dueIn: "muddati",
      days: "kun",
      overdue: "Muddati o'tgan",
      markPaid: "To'langan deb belgilash",
      billName: "Hisob nomi",
      amount: "Miqdor",
      dueDate: "To'lov sanasi",
      save: "Saqlash",
      cancel: "Bekor qilish",
    },
    ru: {
      title: "Напоминания о счетах",
      addBill: "Добавить счет",
      paid: "Оплачено",
      unpaid: "Не оплачено",
      dueIn: "срок через",
      days: "дней",
      overdue: "Просрочено",
      markPaid: "Отметить как оплаченное",
      billName: "Название счета",
      amount: "Сумма",
      dueDate: "Дата оплаты",
      save: "Сохранить",
      cancel: "Отмена",
    },
    en: {
      title: "Bill Reminders",
      addBill: "Add Bill",
      paid: "Paid",
      unpaid: "Unpaid",
      dueIn: "due in",
      days: "days",
      overdue: "Overdue",
      markPaid: "Mark as Paid",
      billName: "Bill Name",
      amount: "Amount",
      dueDate: "Due Date",
      save: "Save",
      cancel: "Cancel",
    },
  }

  const t = texts[language]

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const togglePaid = (billId: string) => {
    setBills((prev) => prev.map((bill) => (bill.id === billId ? { ...bill, isPaid: !bill.isPaid } : bill)))
  }

  const addBill = () => {
    if (newBill.name && newBill.amount && newBill.dueDate) {
      const bill: Bill = {
        id: Date.now().toString(),
        name: newBill.name,
        emoji: newBill.emoji,
        amount: Number.parseFloat(newBill.amount),
        dueDate: newBill.dueDate,
        isPaid: false,
      }
      setBills((prev) => [...prev, bill])
      setNewBill({ name: "", emoji: "💡", amount: "", dueDate: "" })
      setShowAddModal(false)
    }
  }

  const upcomingBills = bills.filter((bill) => !bill.isPaid)

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t.title}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingBills.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <div className="text-2xl mb-2">✅</div>
              <p>Barcha hisob-kitoblar to'langan!</p>
            </div>
          ) : (
            upcomingBills.map((bill) => {
              const daysUntilDue = getDaysUntilDue(bill.dueDate)
              const isOverdue = daysUntilDue < 0
              const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0

              return (
                <div
                  key={bill.id}
                  className={`p-3 rounded-lg border ${
                    isOverdue
                      ? "bg-red-50 border-red-200"
                      : isUrgent
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{bill.emoji}</span>
                      <div>
                        <div className="font-medium">{bill.name}</div>
                        <div className="text-sm text-gray-600">{bill.amount.toLocaleString()} so'm</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={isOverdue ? "destructive" : isUrgent ? "secondary" : "outline"} className="mb-2">
                        {isOverdue ? t.overdue : `${daysUntilDue} ${t.days}`}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => togglePaid(bill.id)} className="block w-full">
                        {t.markPaid}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{t.addBill}</DialogTitle>
            <DialogDescription>Add a new bill reminder with due date</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.billName}</label>
              <Input
                value={newBill.name}
                onChange={(e) => setNewBill((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Elektr energiya"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Emoji</label>
              <div className="flex gap-2 mt-2">
                {["💡", "🌐", "🔥", "💧", "📱", "🏠"].map((emoji) => (
                  <Button
                    key={emoji}
                    type="button"
                    variant={newBill.emoji === emoji ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewBill((prev) => ({ ...prev, emoji }))}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t.amount}</label>
              <Input
                type="number"
                value={newBill.amount}
                onChange={(e) => setNewBill((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="150000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.dueDate}</label>
              <Input
                type="date"
                value={newBill.dueDate}
                onChange={(e) => setNewBill((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                {t.cancel}
              </Button>
              <Button onClick={addBill} className="flex-1">
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
