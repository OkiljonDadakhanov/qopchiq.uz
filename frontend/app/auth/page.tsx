"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Smartphone, User, Lock, Globe, Zap } from "lucide-react";

export default function AuthPage() {
  const [telegramId, setTelegramId] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    login,
    isAuthenticated,
    telegramWebApp,
    isTelegramAvailable,
    loading: authLoading,
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleTelegramLogin = async () => {
    if (!telegramWebApp) {
      setError(
        "Telegram Web App is not available. Please open this app from Telegram."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const telegramUser = telegramWebApp.initDataUnsafe?.user;
      if (!telegramUser) {
        setError("Unable to get Telegram user data. Please try again.");
        return;
      }

      await login({
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username || undefined,
        firstName: telegramUser.first_name || undefined,
        lastName: telegramUser.last_name || undefined,
        language: telegramUser.language_code === "en" ? "en" : "uz",
      });

      router.push("/");
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Telegram login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!telegramId.trim()) {
      setError("Telegram ID is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login({
        telegramId: telegramId.trim(),
        username: username.trim() || undefined,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        language: "uz",
      });

      router.push("/");
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError("");

      await login({
        telegramId: "123456789",
        username: "demo_user",
        firstName: "Demo",
        lastName: "User",
        language: "uz",
      });

      router.push("/");
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Qopchiq.uz
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your Financial & Health Buddy
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Development Mode Notice */}
            {!isTelegramAvailable && (
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Running in development mode. Use demo login, manual login, or
                  open from Telegram for full features.
                </AlertDescription>
              </Alert>
            )}

            {/* Demo Login Button (Development Only) */}
            {!isTelegramAvailable && (
              <Button
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Demo Login (Development)
                  </>
                )}
              </Button>
            )}

            {/* Telegram Login Button */}
            {isTelegramAvailable && !isManualMode && (
              <Button
                onClick={handleTelegramLogin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-5 w-5" />
                    Login with Telegram
                  </>
                )}
              </Button>
            )}

            {/* Manual Login Form */}
            {isManualMode && (
              <form onSubmit={handleManualLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="telegramId">Telegram ID *</Label>
                  <Input
                    id="telegramId"
                    type="text"
                    placeholder="Enter your Telegram ID"
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username (optional)</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name (optional)</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name (optional)</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            )}

            {/* Toggle between modes */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setIsManualMode(!isManualMode)}
                className="text-blue-600 hover:text-blue-700"
              >
                {isManualMode
                  ? isTelegramAvailable
                    ? "Use Telegram Login"
                    : "Manual Login Only"
                  : "Manual Login"}
              </Button>
            </div>

            {/* Info text */}
            <div className="text-center text-sm text-gray-500 pt-4">
              <p>Track your expenses and health habits</p>
              <p>with emoji-driven design for Uzbekistan users</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
