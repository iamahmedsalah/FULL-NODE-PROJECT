import axios from "axios";

const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  if (import.meta.env.PROD) {
    // Production fallback for this project backend on Vercel.
    return "https://full-node-project.vercel.app";
  }

  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;
