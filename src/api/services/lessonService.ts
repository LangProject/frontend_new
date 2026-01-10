import axios from "axios";

const getHeaders = () => {
  const sessionId = localStorage.getItem("session_id");
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {};
  if (sessionId) headers["x-session-id"] = sessionId;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export const LessonService = {
  getStats: async () => {
    try {
      // 1. Отримуємо повні дані профілю
      const response = await axios.get("/user/stats", {
        headers: getHeaders(),
      });
      const data = response.data;

      // 2. Витягуємо ELO та Рівень з складної структури
      let elo = 1200;
      let level = "A1";

      // Логіка пошуку: беремо перший знайдений рейтинг (або уточніть ID секції, якщо є)
      if (data?.language_data?.ratings) {
        const ratings = data.language_data.ratings;
        const keys = Object.keys(ratings); // ["1", "2"...]
        if (keys.length > 0) {
          const r = ratings[keys[0]]; // Беремо перший
          elo = Math.round(r.elo); // Округляємо
          level = r.cefr;
        }
      }

      return { elo, level };
    } catch (error) {
      console.warn("Stats fetch failed", error);
      return { elo: 1200, level: "A1" };
    }
  },

  getNextTask: async () => {
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

  endLevel: async () => {
    // await axios.post("/session/end-level", {}, { headers: getHeaders() });
  },
};
