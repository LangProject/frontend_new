import axios from "axios";

const getHeaders = () => {
  const sessionId = localStorage.getItem("session_id");
  const token = localStorage.getItem("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (sessionId) headers["x-session-id"] = sessionId;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
};

export const LessonService = {
  getStats: async () => {
    try {
      const response = await axios.get("/user/stats", {
        headers: getHeaders(),
      });
      const data = response.data;
      let elo = 0;
      let level = "A1";

      if (data?.language_data?.ratings) {
        const ratings = data.language_data.ratings;
        const keys = Object.keys(ratings);
        if (keys.length > 0) {
          const r = ratings[keys[0]];
          if (r.elo !== undefined) elo = Math.round(r.elo);
          if (r.cefr) level = r.cefr;
        }
      }
      return { elo, level };
    } catch (error) {
      console.warn("Stats fetch failed", error);
      return { elo: 0, level: "A1" };
    }
  },

  getNextTask: async () => {
    const response = await axios.get("/session/exercise", {
      headers: getHeaders(),
    });
    return response.data;
  },

  submitAnswer: async (payload: {
    exercise_id: string;
    type: string;
    answer: any;
  }) => {
    // ИСПРАВЛЕНИЕ НА ОСНОВЕ ЛОГА ОШИБКИ:
    const body = {
      exercise_id: payload.exercise_id, // Сервер требует exercise_id!
      type: payload.type, // Сервер требует type!
      answer: payload.answer,
    };

    // Примечание: task_id отправлять НЕЛЬЗЯ (сервер ругается "Extra inputs forbidden")

    try {
      const response = await axios.post("/session/answer", body, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        console.error(
          "SERVER VALIDATION ERROR:",
          JSON.stringify(error.response.data, null, 2)
        );
      }
      throw error;
    }
  },

  endLevel: async () => {
    // await axios.post("/session/end-level", {}, { headers: getHeaders() });
  },
};
