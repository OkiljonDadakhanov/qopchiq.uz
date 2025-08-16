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
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
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

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
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

  // Gamification methods
  async earnCoins(coinData) {
    return this.request("/gamification/earn-coins", {
      method: "POST",
      body: coinData,
    });
  }

  async getLeaderboard(type = "coins") {
    return this.request(`/gamification/leaderboard?type=${type}`);
  }

  async getUserBadges(userId) {
    return this.request(`/gamification/badges?userId=${userId}`);
  }

  async getChallenges(userId) {
    return this.request(`/gamification/challenges?userId=${userId}`);
  }

  // Analytics methods
  async getOverviewAnalytics(userId, period = "month") {
    return this.request(
      `/analytics/overview?userId=${userId}&period=${period}`
    );
  }

  async getExpenseAnalyticsDetailed(userId, period = "month") {
    return this.request(
      `/analytics/expenses?userId=${userId}&period=${period}`
    );
  }

  async getMealAnalyticsDetailed(userId, period = "month") {
    return this.request(`/analytics/meals?userId=${userId}&period=${period}`);
  }

  async getHealthAnalytics(userId, period = "month") {
    return this.request(`/analytics/health?userId=${userId}&period=${period}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
