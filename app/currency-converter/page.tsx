"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, TrendingUp, Clock } from "lucide-react"
import { Navigation } from "@/components/navigation"

// Mock exchange rates with historical data
const exchangeRates = {
  USD: { rate: 12300, change: +0.5 },
  EUR: { rate: 13400, change: -0.3 },
  RUB: { rate: 135, change: +1.2 },
}

const historicalRates = [
  { date: "2024-01-15", USD: 12250, EUR: 13350, RUB: 133 },
  { date: "2024-01-14", USD: 12200, EUR: 13300, RUB: 132 },
  { date: "2024-01-13", USD: 12180, EUR: 13280, RUB: 131 },
]

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState("100000")
  const [fromCurrency, setFromCurrency] = useState<"UZS" | "USD" | "EUR" | "RUB">("UZS")
  const [toCurrency, setToCurrency] = useState<"UZS" | "USD" | "EUR" | "RUB">("USD")
  const [result, setResult] = useState(0)
  const [language, setLanguage] = useState<"uz" | "ru" | "en">("uz")
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const savedLanguage = localStorage.getItem("qopchiq-language")
    const savedFavorites = localStorage.getItem("qopchiq-currency-favorites")

    if (savedLanguage) setLanguage(savedLanguage as "uz" | "ru" | "en")
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const texts = {
    uz: {
      title: "Valyuta konvertori",
      amount: "Miqdor",
      from: "Dan",
      to: "Ga",
      convert: "Konvertatsiya",
      result: "Natija",
      rates: "Kurslar",
      change: "O'zgarish",
      history: "Tarix",
      favorites: "Sevimlilar",
      addToFavorites: "Sevimlilarga qo'shish",
    },
    ru: {
      title: "Конвертер валют",
      amount: "Сумма",
      from: "Из",
      to: "В",
      convert: "Конвертировать",
      result: "Результат",
      rates: "Курсы",
      change: "Изменение",
      history: "История",
      favorites: "Избранное",
      addToFavorites: "Добавить в избранное",
    },
    en: {
      title: "Currency Converter",
      amount: "Amount",
      from: "From",
      to: "To",
      convert: "Convert",
      result: "Result",
      rates: "Rates",
      change: "Change",
      history: "History",
      favorites: "Favorites",
      addToFavorites: "Add to Favorites",
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
        convertedAmount = inputAmount / exchangeRates[toCurrency].rate
      }
    } else {
      if (toCurrency === "UZS") {
        convertedAmount = inputAmount * exchangeRates[fromCurrency].rate
      } else {
        const uzsAmount = inputAmount * exchangeRates[fromCurrency].rate
        convertedAmount = uzsAmount / exchangeRates[toCurrency].rate
      }
    }

    setResult(convertedAmount)
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const addToFavorites = () => {
    const conversion = `${fromCurrency}-${toCurrency}`
    if (!favorites.includes(conversion)) {
      const newFavorites = [...favorites, conversion]
      setFavorites(newFavorites)
      localStorage.setItem("qopchiq-currency-favorites", JSON.stringify(newFavorites))
    }
  }

  useEffect(() => {
    convertCurrency()
  }, [amount, fromCurrency, toCurrency])

  const currencyFlags = {
    UZS: "🇺🇿",
    USD: "🇺🇸",
    EUR: "🇪🇺",
    RUB: "🇷🇺",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span>💱</span>
            {t.title}
          </h1>
        </div>

        {/* Main Converter */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t.convert}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.amount}</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100000"
                className="text-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium">{t.from}</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as any)}
                  className="w-full p-3 border rounded-md text-lg"
                >
                  <option value="UZS">{currencyFlags.UZS} UZS</option>
                  <option value="USD">{currencyFlags.USD} USD</option>
                  <option value="EUR">{currencyFlags.EUR} EUR</option>
                  <option value="RUB">{currencyFlags.RUB} RUB</option>
                </select>
              </div>

              <Button variant="ghost" size="sm" onClick={swapCurrencies} className="mt-6">
                <ArrowUpDown className="h-5 w-5" />
              </Button>

              <div className="flex-1">
                <label className="text-sm font-medium">{t.to}</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as any)}
                  className="w-full p-3 border rounded-md text-lg"
                >
                  <option value="UZS">{currencyFlags.UZS} UZS</option>
                  <option value="USD">{currencyFlags.USD} USD</option>
                  <option value="EUR">{currencyFlags.EUR} EUR</option>
                  <option value="RUB">{currencyFlags.RUB} RUB</option>
                </select>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">{t.result}</div>
              <div className="text-3xl font-bold text-blue-600">
                {result.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {toCurrency}
              </div>
            </div>

            <Button onClick={addToFavorites} variant="outline" className="w-full bg-transparent">
              ⭐ {t.addToFavorites}
            </Button>
          </CardContent>
        </Card>

        {/* Current Rates */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t.rates}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(exchangeRates).map(([currency, data]) => (
              <div key={currency} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currencyFlags[currency as keyof typeof currencyFlags]}</span>
                  <div>
                    <div className="font-medium">1 {currency}</div>
                    <div className="text-sm text-gray-600">{data.rate.toLocaleString()} UZS</div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${data.change > 0 ? "text-green-600" : "text-red-600"}`}>
                  {data.change > 0 ? "+" : ""}
                  {data.change}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Favorites */}
        {favorites.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">⭐ {t.favorites}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {favorites.map((fav) => {
                const [from, to] = fav.split("-")
                return (
                  <Button
                    key={fav}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      setFromCurrency(from as any)
                      setToCurrency(to as any)
                    }}
                  >
                    {currencyFlags[from as keyof typeof currencyFlags]} {from} →{" "}
                    {currencyFlags[to as keyof typeof currencyFlags]} {to}
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Historical Data */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t.history}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {historicalRates.map((rate) => (
              <div key={rate.date} className="flex items-center justify-between p-2 text-sm">
                <span className="text-gray-600">{rate.date}</span>
                <div className="flex gap-4">
                  <span>USD: {rate.USD.toLocaleString()}</span>
                  <span>EUR: {rate.EUR.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Navigation language={language} />
    </div>
  )
}
