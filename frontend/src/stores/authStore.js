import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/client";

const normalizeUser = (payload) => {
  const developer = payload?.developer || payload?.user || payload?.data || payload;
  if (!developer || typeof developer !== "object") return null;

  return {
    _id: developer._id,
    username: developer.username,
    email: developer.email,
    apiKey: developer.apiKey || developer.api_key || null,
  };
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post("/api/auth/login", { email, password });
          set({ user: normalizeUser(data), loading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || "Login failed";
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      register: async (username, email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post("/api/auth/signup", { username, email, password });
          set({ user: normalizeUser(data), loading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || "Registration failed";
          set({ error: msg, loading: false });
          return { success: false, message: msg };
        }
      },

      logout: async () => {
        try {
          await api.get("/api/auth/logout");
        } catch (_) {}
        set({ user: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
