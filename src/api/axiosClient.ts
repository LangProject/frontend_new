import axios from "axios";

const $api = axios.create({
  baseURL: "https://backend-production-bd6c.up.railway.app",
  headers: { "Content-Type": "application/json" },
});

$api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  const sessionId = localStorage.getItem("session_id");

  if (config.headers) {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (sessionId) config.headers["x-session-id"] = sessionId;
  }
  return config;
});

$api.interceptors.request.use((config) => {
  console.log(`🚀 [AXIOS REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
  console.log("🔑 Headers:", config.headers);
  return config;
});

$api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("💥 [AXIOS ERROR]", error.response?.status, error.response?.data);
    console.log("📝 Request Headers was:", error.config?.headers);
    return Promise.reject(error);
  }
);

export default $api;