import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Automatically inject X-Admin-Key for admin endpoints
  if (config.url && (config.url.startsWith("/admin") || config.url.includes("/admin/"))) {
    const adminKey = localStorage.getItem("kemet_admin_key") || "kemet-admin-2026-secret";
    config.headers["X-Admin-Key"] = adminKey;
  }

  return config;
}, (error) => Promise.reject(error));

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosClient;
