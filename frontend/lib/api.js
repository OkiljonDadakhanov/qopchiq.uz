// API client configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.isRefreshing = false; // Add flag to prevent infinite loops
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    }
  }

  getToken() {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      // Handle token refresh for 401 errors
      if (
        response.status === 401 &&
        token &&
        !this.isRefreshing &&
        endpoint !== "/auth/refresh"
      ) {
        this.isRefreshing = true;
        try {
          const newToken = await this.refreshToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, config);
            return await retryResponse.json();
          }
        } finally {
          this.isRefreshing = false;
        }
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async refreshToken() {
    try {
      // Use fetch directly to avoid recursive calls
      const url = `${this.baseURL}/auth/refresh`;
      const token = this.getToken();

      if (!token) {
        return null;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        this.setToken(data.data.token);
        return data.data.token;
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

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  // User stats and data
  async getUserStats(userId) {
    return this.request(`/users/${userId}/stats`);
  }

  // Expense methods
  async getExpenses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/expenses?${queryString}`);
  }

  async createExpense(expenseData) {
    return this.request("/expenses", {
      method: "POST",
      body: JSON.stringify(expenseData),
    });
  }

  async updateExpense(expenseId, expenseData) {
    return this.request(`/expenses/${expenseId}`, {
      method: "PUT",
      body: JSON.stringify(expenseData),
    });
  }

  async deleteExpense(expenseId) {
    return this.request(`/expenses/${expenseId}`, {
      method: "DELETE",
    });
  }

  async getRecentExpenses(userId, limit = 10) {
    return this.request(`/expenses?userId=${userId}&limit=${limit}`);
  }

  // Meal methods
  async getMeals(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/meals?${queryString}`);
  }

  async createMeal(mealData) {
    return this.request("/meals", {
      method: "POST",
      body: JSON.stringify(mealData),
    });
  }

  async updateMeal(mealId, mealData) {
    return this.request(`/meals/${mealId}`, {
      method: "PUT",
      body: JSON.stringify(mealData),
    });
  }

  async deleteMeal(mealId) {
    return this.request(`/meals/${mealId}`, {
      method: "DELETE",
    });
  }

  async getRecentMeals(userId, limit = 10) {
    return this.request(`/meals?userId=${userId}&limit=${limit}`);
  }

  async getDailyCalories(userId, date) {
    return this.request(`/meals/calories?userId=${userId}&date=${date}`);
  }

  // Health methods
  async logExercise(exerciseData) {
    return this.request("/health/exercise", {
      method: "POST",
      body: JSON.stringify(exerciseData),
    });
  }

  async getExerciseHistory(userId, limit = 20) {
    return this.request(`/health/exercise?userId=${userId}&limit=${limit}`);
  }

  async trackWater(waterData) {
    return this.request("/health/water", {
      method: "POST",
      body: JSON.stringify(waterData),
    });
  }

  // Gamification methods
  async getLeaderboard(userId) {
    return this.request(`/gamification/leaderboard?userId=${userId}`);
  }

  async getUserBadges(userId) {
    return this.request(`/gamification/badges?userId=${userId}`);
  }

  async getChallenges(userId) {
    return this.request(`/gamification/challenges?userId=${userId}`);
  }

  async joinChallenge(challengeId, userId) {
    return this.request(`/gamification/challenges/${challengeId}/join`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async updateChallengeProgress(challengeId, userId, progress) {
    return this.request(`/gamification/challenges/${challengeId}/progress`, {
      method: "PUT",
      body: JSON.stringify({ userId, progress }),
    });
  }

  async levelUp(userId) {
    return this.request(`/gamification/level-up`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
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
