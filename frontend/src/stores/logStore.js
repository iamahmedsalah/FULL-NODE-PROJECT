import { create } from "zustand";
import api from "../api/client";

const useLogStore = create((set, get) => ({
  logs: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  filters: { level: "", search: "", sort: "recent" },
  loading: false,
  error: null,

  fetchLogs: async (appName, overrides = {}) => {
    const { filters, pagination } = get();
    const merged = { ...filters, page: pagination.page, ...overrides };
    set({ loading: true, error: null });
    try {
      const params = {};
      if (merged.page) params.page = merged.page;
      params.limit = 10;
      if (merged.sort === "count") {
        params.sortBy = "count";
        params.order = "desc";
      } else {
        params.sortBy = "createdAt";
        params.order = "desc";
      }
      if (merged.level) params.level = merged.level;
      if (merged.search) params.message = merged.search;

      const { data } = await api.get(`/api/apps/${appName}/logs`, { params });

      const logs = data.data || data.logs || data.results || data;
      const total = data.total || data.pagination?.total || (Array.isArray(logs) ? logs.length : 0);
      const totalPages = data.totalPages || data.pagination?.totalPages || Math.ceil(total / 10) || 1;

      set({
        logs: Array.isArray(logs) ? logs : [],
        pagination: {
          page: data.pagination?.currentPage || merged.page,
          limit: 10,
          total,
          totalPages,
        },
        filters: {
          level: merged.level ?? filters.level,
          search: merged.search ?? filters.search,
          sort: merged.sort ?? filters.sort,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch logs", loading: false });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  setPage: (page) => {
    set((state) => ({ pagination: { ...state.pagination, page } }));
  },

  resetLogs: () =>
    set({
      logs: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
      filters: { level: "", search: "", sort: "recent" },
    }),
}));

export default useLogStore;
