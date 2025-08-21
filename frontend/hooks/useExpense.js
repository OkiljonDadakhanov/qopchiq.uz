"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "./useAuth.tsx";

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const fetchExpenses = async (params = {}) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiClient.getExpenses({
        userId: user._id,
        ...params,
      });
      setExpenses(response.expenses || []);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expenseData) => {
    try {
      const response = await apiClient.createExpense({
        userId: user._id,
        ...expenseData,
      });
      await fetchExpenses(); // Refresh list
      return response;
    } catch (error) {
      console.error("Failed to create expense:", error);
      throw error;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const response = await apiClient.updateExpense(id, expenseData);
      await fetchExpenses(); // Refresh list
      return response;
    } catch (error) {
      console.error("Failed to update expense:", error);
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await apiClient.deleteExpense(id);
      await fetchExpenses(); // Refresh list
    } catch (error) {
      console.error("Failed to delete expense:", error);
      throw error;
    }
  };

  const fetchAnalytics = async (period = "month") => {
    if (!user) return;

    try {
      const response = await apiClient.getExpenseAnalytics(period);
      setAnalytics(response);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchAnalytics();
    }
  }, [user]);

  return {
    expenses,
    analytics,
    loading,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchAnalytics,
  };
}
