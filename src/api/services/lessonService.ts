import axios from "axios";

export const LessonService = {
  getStats: async () => {
    const sessionId = localStorage.getItem("session_id");
    // ищем правильный ключ 'auth_token'
    const token = localStorage.getItem("auth_token");

    if (!token) {
      console.warn("Нет токена (auth_token не найден)");
      return { elo: 1200, level: "A1" };
    }

    try {
      const response = await axios.get("/user/stats", {
        headers: {
          "x-session-id": sessionId || "",
          Authorization: `Bearer ${token}`,
        },
      });
      return { elo: 1200, level: "A1" };
    } catch (error) {
      return { elo: 1200, level: "A1" };
    }
  },

  getNextTask: async () => {
    const sessionId = localStorage.getItem("session_id");
    const token = localStorage.getItem("auth_token");

    if (!sessionId) throw new Error("No session ID found");

    const response = await axios.get("/session/exercise", {
      headers: {
        "x-session-id": sessionId,
        Authorization: `Bearer ${token || ""}`,
      },
    });

    return response.data;
  },

  submitAnswer: async (data: any) => {
    const sessionId = localStorage.getItem("session_id");
    const token = localStorage.getItem("auth_token");

    const response = await axios.post("/session/exercise/solve", data, {
      headers: {
        "x-session-id": sessionId,
        Authorization: `Bearer ${token || ""}`,
      },
    });

    return response.data;
  },

  endLevel: async () => {},
};
