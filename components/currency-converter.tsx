"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

interface CurrencyConverterProps {
  language: "uz" | "ru" | "en"
}

// Mock exchange rates - in real app, fetch from API
const exchangeRates = {
  USD: 12300,
  EUR: 13400,
  RUB: 135,
}

export function CurrencyConverter({ language }: CurrencyConverterProps) {
  const [amount, setAmount] = useState("100000")
  const [fromCurrency, setFromCurrency] = useState<"UZS" | "USD" | "EUR" | "RUB">("UZS")
  const [toCurrency, setToCurrency] = useState<"UZS" | "USD" | "EUR" | "RUB">("USD")
  const [result, setResult] = useState(0)

  const texts = {
    uz: {
      title: "Valyuta konvertori",
      amount: "Miqdor",
      from: "Dan",
      to: "Ga",
      convert: "Konvertatsiya",
      result: "Natija",
    },
    ru: {
      title: "Конвертер валют",
      amount: "Сумма",
      from: "Из",
      to: "В",
      convert: "Конвертировать",
      result: "Результат",
    },
    en: {
      title: "Currency Converter",
      amount: "Amount",
      from: "From",
      to: "To",
      convert: "Convert",
      result: "Result",
    },
  }

  const t = texts[language]

  const convertCurrency = () => {
    const inputAmount = Number.parseFloat(amount) || 0
    let convertedAmount = 0

    if (fromCurrency === "UZS") {
      if (toCurrency === "UZS") {
        convertedAmount = inputAmount
      } else {
        convertedAmount = inputAmount / exchangeRates[toCurrency]
      }
    } else {
      if (toCurrency === "UZS") {
        convertedAmount = inputAmount * exchangeRates[fromCurrency]
      } else {
        // Convert through UZS
        const uzsAmount = inputAmount * exchangeRates[fromCurrency]
        convertedAmount = uzsAmount / exchangeRates[toCurrency]
      }
    }

    setResult(convertedAmount)
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  useEffect(() => {
    convertCurrency()
  }, [amount, fromCurrency, toCurrency])

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>💱</span>
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">{t.amount}</label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100000" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium">{t.from}</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value="UZS">🇺🇿 UZS</option>
              <option value="USD">🇺🇸 USD</option>
              <option value="EUR">🇪🇺 EUR</option>
              <option value="RUB">🇷🇺 RUB</option>
            </select>
          </div>

          <Button variant="ghost" size="sm" onClick={swapCurrencies} className="mt-6">
            <ArrowUpDown className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <label className="text-sm font-medium">{t.to}</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value="UZS">🇺🇿 UZS</option>
              <option value="USD">🇺🇸 USD</option>
              <option value="EUR">🇪🇺 EUR</option>
              <option value="RUB">🇷🇺 RUB</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600">{t.result}</div>
          <div className="text-2xl font-bold text-blue-600">
            {result.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {toCurrency}
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          1 USD = {exchangeRates.USD.toLocaleString()} UZS
          <br />1 EUR = {exchangeRates.EUR.toLocaleString()} UZS
        </div>
      </CardContent>
    </Card>
  )
}
