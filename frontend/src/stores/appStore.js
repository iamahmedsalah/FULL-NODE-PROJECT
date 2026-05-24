import { create } from "zustand";
import api from "../api/client";

const useAppStore = create((set, get) => ({
  apps: [],
  currentApp: null,
  loading: false,
  error: null,

  fetchApps: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/api/apps/");
      set({ apps: data.data || data.apps || data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch apps", loading: false });
    }
  },

  fetchAppByName: async (name) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/api/apps/get/${name}`);
      const app = data.data || data.app || data;
      set({ currentApp: app, loading: false });
      return app;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch app", loading: false });
    }
  },

  createApp: async (name, description) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/api/apps/create", { name, description });
      const newApp = data.data || data.app || data;
      set((state) => ({ apps: [...state.apps, newApp], loading: false }));
      return { success: true, app: newApp };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create app";
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  deleteApp: async (name) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/api/apps/delete/${name}`);
      set((state) => ({
        apps: state.apps.filter((a) => (a.name || a) !== name),
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete app";
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentApp: () => set({ currentApp: null }),
}));

export default useAppStore;
