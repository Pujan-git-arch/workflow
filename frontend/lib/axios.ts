import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("workflow-auth-store");

    if (token) {
      try {
        const parsed = JSON.parse(token) as { state?: { token?: string } };
        const authToken = parsed.state?.token;

        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }
      } catch {
        // ignore invalid stored auth payloads
      }
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      window.localStorage.removeItem("workflow-auth-store");
      window.location.href = "/login";
    }

    // Improve error messages
    const message = error.response?.data?.detail || error.message || "API Error";
    console.error("API Error Response:", {
      status: error.response?.status,
      data: error.response?.data,
      message,
    });

    return Promise.reject(new Error(message));
  }
);

export default api;