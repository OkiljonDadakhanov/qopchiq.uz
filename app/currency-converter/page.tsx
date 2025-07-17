"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, TrendingUp } from "lucide-react";
import { Navigation } from "@/components/navigation";

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState("100000");
  const [fromCurrency, setFromCurrency] = useState<
    "UZS" | "USD" | "EUR" | "RUB"
  >("UZS");
  const [toCurrency, setToCurrency] = useState<"UZS" | "USD" | "EUR" | "RUB">(
    "USD"
  );
  const [result, setResult] = useState(0);
  const [language, setLanguage] = useState<"uz" | "ru" | "en">("uz");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [exchangeRates, setExchangeRates] = useState<{
    [key: string]: { rate: number };
  }>({});

  useEffect(() => {
    const savedLanguage = localStorage.getItem("qopchiq-language");
    const savedFavorites = localStorage.getItem("qopchiq-currency-favorites");
    if (savedLanguage) setLanguage(savedLanguage as any);
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    const fetchRates = async () => {
      try {
        const res = await fetch(
          "https://api.currencyapi.com/v3/latest?apikey=cur_live_3ZpirJ5POKtb4nRjcGirJKwtCWgjMf6oeI4gw153"
        );
        const data = await res.json();

        const baseToUZS = data.data["UZS"].value;
        const filtered = ["USD", "EUR", "RUB", "UZS"];
        const mappedRates: { [key: string]: { rate: number } } = {};

        filtered.forEach((code) => {
          const baseValue = data.data[code].value;
          mappedRates[code] = {
            rate: baseToUZS / baseValue, // How many UZS in 1 CODE
          };
        });

        setExchangeRates(mappedRates);
      } catch (err) {
        console.error("Failed to fetch exchange rates:", err);
      }
    };

    fetchRates();
  }, []);

  useEffect(() => {
    convertCurrency();
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

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
  };

  const t = texts[language];

  const currencyFlags = {
    UZS: "🇺🇿",
    USD: "🇺🇸",
    EUR: "🇪🇺",
    RUB: "🇷🇺",
  };

  const convertCurrency = () => {
    const amt = parseFloat(amount) || 0;
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency])
      return setResult(0);

    const fromRate = exchangeRates[fromCurrency].rate;
    const toRate = exchangeRates[toCurrency].rate;

    const converted = (amt * fromRate) / toRate;
    setResult(converted);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const addToFavorites = () => {
    const conversion = `${fromCurrency}-${toCurrency}`;
    if (!favorites.includes(conversion)) {
      const updated = [...favorites, conversion];
      setFavorites(updated);
      localStorage.setItem(
        "qopchiq-currency-favorites",
        JSON.stringify(updated)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span>💱</span> {t.title}
          </h1>
        </div>

        {/* Converter */}
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
                  {Object.keys(currencyFlags).map((code) => (
                    <option key={code} value={code}>
                      {currencyFlags[code]} {code}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={swapCurrencies}
                className="mt-6"
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>

              <div className="flex-1">
                <label className="text-sm font-medium">{t.to}</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as any)}
                  className="w-full p-3 border rounded-md text-lg"
                >
                  {Object.keys(currencyFlags).map((code) => (
                    <option key={code} value={code}>
                      {currencyFlags[code]} {code}
                    </option>
                  ))}
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

            <Button
              onClick={addToFavorites}
              variant="outline"
              className="w-full bg-transparent"
            >
              ⭐ {t.addToFavorites}
            </Button>
          </CardContent>
        </Card>

        {/* Exchange Rates */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t.rates}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(exchangeRates).map(([code, data]) => (
              <div
                key={code}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {currencyFlags[code as keyof typeof currencyFlags]}
                  </span>
                  <div>
                    <div className="font-medium">1 {code}</div>
                    <div className="text-sm text-gray-600">
                      {data.rate.toLocaleString()} UZS
                    </div>
                  </div>
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
                const [from, to] = fav.split("-");
                return (
                  <Button
                    key={fav}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      setFromCurrency(from as any);
                      setToCurrency(to as any);
                    }}
                  >
                    {currencyFlags[from as keyof typeof currencyFlags]} {from} →{" "}
                    {currencyFlags[to as keyof typeof currencyFlags]} {to}
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      <Navigation language={language} />
    </div>
  );
}
