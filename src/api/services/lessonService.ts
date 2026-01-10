import axios from "axios";

// Helper to get headers with session ID
const getHeaders = () => {
  const sessionId = localStorage.getItem("session_id");
  const token = localStorage.getItem("auth_token");

  const headers: Record<string, string> = {};

  if (sessionId) {
    headers["x-session-id"] = sessionId;
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const LessonService = {
  getStats: async () => {
    try {
      const response = await axios.get("/user/stats", {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.warn("Stats fetch failed", error);
      // Возвращаем дефолт, чтобы не ломать UI
      return { elo: 1200, level: "A1" };
    }
  },

  getNextTask: async () => {
    // Получаем задачу (ID сессии берется из localStorage внутри getHeaders)
    const response = await axios.get("/session/exercise", {
      headers: getHeaders(),
    });
    return response.data;
  },

  submitAnswer: async (data: any) => {
    const response = await axios.post("/session/answer", data, {
      headers: getHeaders(),
    });

    return response.data;
  },

  endLevel: async () => {},
};
