"use client";

import { useState } from "react";
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
import { Plus, Handshake, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Debt {
  id: string;
  name: string; // Person or entity
  amount: number;
  dueDate: string;
  type: "owed" | "lent"; // Owed by me, or lent by me
  isPaid: boolean;
}

interface DebtTrackerProps {
  language: "uz" | "ru" | "en";
}

export function DebtTracker({ language }: DebtTrackerProps) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDebt, setNewDebt] = useState({
    name: "",
    amount: "",
    dueDate: "",
    type: "owed" as "owed" | "lent",
  });

  const texts = {
    uz: {
      title: "Qarzlarim",
      addDebt: "Qarz qo'shish",
      owedByMe: "Men qarzdorman",
      lentByMe: "Men qarz berdim",
      name: "Ism/Tashkilot",
      amount: "Miqdor (so'm)",
      dueDate: "To'lov sanasi",
      save: "Saqlash",
      cancel: "Bekor qilish",
      markPaid: "To'langan deb belgilash",
      paid: "To'langan",
      unpaid: "To'lanmagan",
      overdue: "Muddati o'tgan",
      dueIn: "muddati",
      days: "kun",
      noDebts: "Hech qanday qarz yo'q",
      totalOwed: "Jami qarzim",
      totalLent: "Jami bergan qarzim",
      debtSnowball: "Qarzni kamaytirish",
      debtSnowballDesc: "Qarzlaringizni kamaytirishda sizga yordam beramiz!",
    },
    ru: {
      title: "Мои долги",
      addDebt: "Добавить долг",
      owedByMe: "Я должен",
      lentByMe: "Мне должны",
      name: "Имя/Организация",
      amount: "Сумма (сум)",
      dueDate: "Дата оплаты",
      save: "Сохранить",
      cancel: "Отмена",
      markPaid: "Отметить как оплаченное",
      paid: "Оплачено",
      unpaid: "Не оплачено",
      overdue: "Просрочено",
      dueIn: "срок через",
      days: "дней",
      noDebts: "Нет долгов",
      totalOwed: "Общая сумма долга",
      totalLent: "Общая сумма выданных долгов",
      debtSnowball: "Снежный ком долгов",
      debtSnowballDesc: "Поможем вам погасить долги быстрее!",
    },
    en: {
      title: "My Debts",
      addDebt: "Add Debt",
      owedByMe: "I Owe",
      lentByMe: "Owed to Me",
      name: "Name/Entity",
      amount: "Amount (UZS)",
      dueDate: "Due Date",
      save: "Save",
      cancel: "Cancel",
      markPaid: "Mark as Paid",
      paid: "Paid",
      unpaid: "Unpaid",
      overdue: "Overdue",
      dueIn: "due in",
      days: "days",
      noDebts: "No debts recorded",
      totalOwed: "Total Owed",
      totalLent: "Total Lent",
      debtSnowball: "Debt Snowball",
      debtSnowballDesc: "Visualize and pay off your debts faster!",
    },
  };

  const t = texts[language];

  const addDebt = () => {
    if (newDebt.name && newDebt.amount && newDebt.dueDate) {
      const debt: Debt = {
        id: Date.now().toString(),
        name: newDebt.name,
        amount: Number.parseFloat(newDebt.amount),
        dueDate: newDebt.dueDate,
        type: newDebt.type,
        isPaid: false,
      };
      setDebts((prev) => [...prev, debt]);
      setNewDebt({ name: "", amount: "", dueDate: "", type: "owed" });
      setShowAddModal(false);
    }
  };

  const togglePaid = (id: string) => {
    setDebts((prev) =>
      prev.map((debt) =>
        debt.id === id ? { ...debt, isPaid: !debt.isPaid } : debt
      )
    );
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalOwed = debts
    .filter((d) => d.type === "owed" && !d.isPaid)
    .reduce((sum, d) => sum + d.amount, 0);
  const totalLent = debts
    .filter((d) => d.type === "lent" && !d.isPaid)
    .reduce((sum, d) => sum + d.amount, 0);
  const totalPaidOwed = debts
    .filter((d) => d.type === "owed" && d.isPaid)
    .reduce((sum, d) => sum + d.amount, 0);
  const totalOwedAmount = debts
    .filter((d) => d.type === "owed")
    .reduce((sum, d) => sum + d.amount, 0);
  const debtSnowballProgress =
    totalOwedAmount > 0 ? (totalPaidOwed / totalOwedAmount) * 100 : 0;

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Handshake className="h-5 w-5" />
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
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">{t.totalOwed}</div>
              <div className="font-bold text-lg text-red-600">
                {totalOwed.toLocaleString()} so'm
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">{t.totalLent}</div>
              <div className="font-bold text-lg text-green-600">
                {totalLent.toLocaleString()} so'm
              </div>
            </div>
          </div>

          {/* Debt Snowball Visualizer */}
          {totalOwedAmount > 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">❄️</span>
                <h3 className="font-medium">{t.debtSnowball}</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">{t.debtSnowballDesc}</p>
              <Progress value={debtSnowballProgress} className="h-3 mb-2" />
              <div className="text-sm text-gray-600 text-center">
                {debtSnowballProgress.toFixed(1)}% {t.paid}
              </div>
            </div>
          )}

          {debts.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <div className="text-4xl mb-2">🤝</div>
              <p>{t.noDebts}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {debts.map((debt) => {
                const daysUntilDue = getDaysUntilDue(debt.dueDate);
                const isOverdue = daysUntilDue < 0 && !debt.isPaid;
                const isUrgent =
                  daysUntilDue <= 3 && daysUntilDue >= 0 && !debt.isPaid;

                return (
                  <div
                    key={debt.id}
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
                        <span className="text-2xl">
                          {debt.type === "owed" ? "🔻" : "🔺"}
                        </span>
                        <div>
                          <div className="font-medium">{debt.name}</div>
                          <div className="text-sm text-gray-600">
                            {debt.amount.toLocaleString()} so'm
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            debt.isPaid
                              ? "default"
                              : isOverdue
                              ? "destructive"
                              : isUrgent
                              ? "secondary"
                              : "outline"
                          }
                          className="mb-2"
                        >
                          {debt.isPaid
                            ? t.paid
                            : isOverdue
                            ? t.overdue
                            : `${t.dueIn} ${daysUntilDue} ${t.days}`}
                        </Badge>
                        {!debt.isPaid && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePaid(debt.id)}
                            className="block w-full"
                          >
                            {t.markPaid}
                          </Button>
                        )}
                      </div>
                    </div>
                    {isOverdue && (
                      <div className="flex items-center gap-1 text-red-600 text-xs mt-2">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{t.overdue}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{t.addDebt}</DialogTitle>
            <DialogDescription>
              Add a new debt you owe or lent to someone
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t.type}</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={newDebt.type === "owed" ? "default" : "outline"}
                  onClick={() =>
                    setNewDebt((prev) => ({ ...prev, type: "owed" }))
                  }
                  className="flex-1"
                >
                  {t.owedByMe}
                </Button>
                <Button
                  type="button"
                  variant={newDebt.type === "lent" ? "default" : "outline"}
                  onClick={() =>
                    setNewDebt((prev) => ({ ...prev, type: "lent" }))
                  }
                  className="flex-1"
                >
                  {t.lentByMe}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="debtName">{t.name}</Label>
              <Input
                id="debtName"
                value={newDebt.name}
                onChange={(e) =>
                  setNewDebt((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ali, Bank, Oila"
              />
            </div>
            <div>
              <Label htmlFor="debtAmount">{t.amount}</Label>
              <Input
                id="debtAmount"
                type="number"
                value={newDebt.amount}
                onChange={(e) =>
                  setNewDebt((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="100000"
              />
            </div>
            <div>
              <Label htmlFor="debtDueDate">{t.dueDate}</Label>
              <Input
                id="debtDueDate"
                type="date"
                value={newDebt.dueDate}
                onChange={(e) =>
                  setNewDebt((prev) => ({ ...prev, dueDate: e.target.value }))
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
              <Button onClick={addDebt} className="flex-1">
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
