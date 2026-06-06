import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach admin key for all /admin/* routes
  if (config.url && config.url.startsWith("/admin")) {
    config.headers["X-Admin-Key"] = import.meta.env.VITE_ADMIN_SECRET_KEY || "kemet-admin-2026-secret";
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    try {
      const { response } = error;
      if (response && response.status === 401) {
        localStorage.removeItem("ACCESS_TOKEN");
      }
    } catch (e) {
      console.error(e);
    }
    throw error;
  }
);

export default axiosClient;
