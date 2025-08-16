// API client configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  getToken() {
    if (typeof window !== "undefined") {
      return this.token || localStorage.getItem("auth_token");
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: "include", // Include cookies for JWT refresh
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && token) {
          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              // Retry the original request with new token
              config.headers.Authorization = `Bearer ${newToken}`;
              const retryResponse = await fetch(url, config);
              const retryData = await retryResponse.json();

              if (!retryResponse.ok) {
                throw new Error(retryData.message || "API request failed");
              }
              return retryData;
            }
          } catch (refreshError) {
            // Refresh failed, clear token and throw original error
            this.setToken(null);
            if (typeof window !== "undefined") {
              localStorage.removeItem("auth_token");
            }
          }
        }

        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth methods
  async login(telegramData) {
    const response = await this.request("/auth/telegram", {
      method: "POST",
      body: telegramData,
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async refreshToken() {
    try {
      const response = await this.request("/auth/refresh", {
        method: "POST",
      });

      if (response.success && response.data?.token) {
        this.setToken(response.data.token);
        return response.data.token;
      }
      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }

  async getProfile() {
    return this.request("/auth/profile");
  }

  // User methods
  async getUser(telegramId) {
    return this.request(`/users/${telegramId}`);
  }

  async updateUser(telegramId, userData) {
    return this.request(`/users/${telegramId}`, {
      method: "PUT",
      body: userData,
    });
  }

  async getUserStats(telegramId) {
    return this.request(`/users/${telegramId}/stats`);
  }

  // Expense methods
  async getExpenses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/expenses${queryString ? `?${queryString}` : ""}`);
  }

  async createExpense(expenseData) {
    return this.request("/expenses", {
      method: "POST",
      body: expenseData,
    });
  }

  async updateExpense(id, expenseData) {
    return this.request(`/expenses/${id}`, {
      method: "PUT",
      body: expenseData,
    });
  }

  async deleteExpense(id) {
    return this.request(`/expenses/${id}`, {
      method: "DELETE",
    });
  }

  async getExpenseAnalytics(period = "month") {
    return this.request(`/expenses/analytics?period=${period}`);
  }

  async getRecentExpenses() {
    return this.request("/expenses/recent");
  }

  // Meal methods
  async getMeals(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/meals${queryString ? `?${queryString}` : ""}`);
  }

  async createMeal(mealData) {
    return this.request("/meals", {
      method: "POST",
      body: mealData,
    });
  }

  async updateMeal(id, mealData) {
    return this.request(`/meals/${id}`, {
      method: "PUT",
      body: mealData,
    });
  }

  async deleteMeal(id) {
    return this.request(`/meals/${id}`, {
      method: "DELETE",
    });
  }

  async getMealAnalytics(period = "month") {
    return this.request(`/meals/analytics?period=${period}`);
  }

  async getRecentMeals() {
    return this.request("/meals/recent");
  }

  async getDailyCalories(date) {
    const queryString = date ? `?date=${date}` : "";
    return this.request(`/meals/daily-calories${queryString}`);
  }

  // Health methods
  async calculateBMI(healthData) {
    return this.request("/health/bmi", {
      method: "POST",
      body: healthData,
    });
  }

  async getBMIHistory(userId) {
    return this.request(`/health/bmi/${userId}`);
  }

  async getHealthMetrics(userId) {
    return this.request(`/health/metrics?userId=${userId}`);
  }

  async trackWater(waterData) {
    return this.request("/health/water", {
      method: "POST",
      body: waterData,
    });
  }

  async logExercise(exerciseData) {
    return this.request("/health/exercise", {
      method: "POST",
      body: exerciseData,
    });
  }

  async getExerciseHistory(userId) {
    return this.request(`/health/exercise?userId=${userId}`);
  }

  // Gamification methods
  async earnCoins(coinData) {
    return this.request("/gamification/earn-coins", {
      method: "POST",
      body: coinData,
    });
  }

  async getLeaderboard(type = "coins", limit = 10, period = "all") {
    const params = new URLSearchParams({ type, limit, period });
    return this.request(`/gamification/leaderboard?${params}`);
  }

  async getUserBadges(userId, category) {
    const params = new URLSearchParams({ userId });
    if (category) params.append("category", category);
    return this.request(`/gamification/badges?${params}`);
  }

  async getChallenges(userId, status = "all") {
    const params = new URLSearchParams({ userId, status });
    return this.request(`/gamification/challenges?${params}`);
  }

  async joinChallenge(challengeData) {
    return this.request("/gamification/challenges/join", {
      method: "POST",
      body: challengeData,
    });
  }

  async updateChallengeProgress(progressData) {
    return this.request("/gamification/challenges/progress", {
      method: "POST",
      body: progressData,
    });
  }

  async levelUp(userId) {
    return this.request("/gamification/level-up", {
      method: "POST",
      body: { userId },
    });
  }

  // Analytics methods
  async getOverviewAnalytics(userId, period = "month") {
    const params = new URLSearchParams({ userId, period });
    return this.request(`/analytics/overview?${params}`);
  }

  async getExpenseAnalyticsDetailed(
    userId,
    period = "month",
    category,
    comparison = false
  ) {
    const params = new URLSearchParams({ userId, period, comparison });
    if (category) params.append("category", category);
    return this.request(`/analytics/expenses?${params}`);
  }

  async getMealAnalyticsDetailed(userId, period = "month", comparison = false) {
    const params = new URLSearchParams({ userId, period, comparison });
    return this.request(`/analytics/meals?${params}`);
  }

  async getHealthAnalytics(userId, period = "month") {
    const params = new URLSearchParams({ userId, period });
    return this.request(`/analytics/health?${params}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
