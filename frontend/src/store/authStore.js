import { create } from "zustand";
import api from "../services/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("access_token"),
  isLoading: false,
  error: null,

  register: async (email, password, firstName, lastName, phone) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone,
      });
      const { access_token, user } = response.data.data;
      localStorage.setItem("access_token", access_token);
      set({ token: access_token, user, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Registration failed",
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, user } = response.data.data;
      localStorage.setItem("access_token", access_token);
      set({ token: access_token, user, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    set({ token: null, user: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ token: null, user: null });
      return;
    }
    set({ token });
  },
}));
