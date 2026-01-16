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

      // Создаем объект со всеми статами
      let result = {
        elo: 0, level: "A1",
        reading_elo: 0, reading_level: "A1",
        vocabulary_elo: 0, vocabulary_level: "A1",
        writing_elo: 0, writing_level: "A1"
      };

      if (data?.language_data?.ratings) {
        const ratings = data.language_data.ratings;

        if (ratings.reading) {
            result.reading_elo = Math.round(ratings.reading.elo || 0);
            result.reading_level = ratings.reading.cefr || "A1";
        }
        if (ratings.vocabulary) {
            result.vocabulary_elo = Math.round(ratings.vocabulary.elo || 0);
            result.vocabulary_level = ratings.vocabulary.cefr || "A1";
        }
        if (ratings.writing) {
            result.writing_elo = Math.round(ratings.writing.elo || 0);
            result.writing_level = ratings.writing.cefr || "A1";
        }
        
        // Общий уровень (Total)
        if (ratings.language_level) {
             result.elo = Math.round(ratings.language_level.elo || 0);
             result.level = ratings.language_level.cefr || "A1";
        } else {
             // Фолбэк на вокабуляр, если общего нет
             result.elo = result.vocabulary_elo;
             result.level = result.vocabulary_level;
        }
      }
      return result;
    } catch (error) {
      console.warn("Stats fetch failed", error);
      return { 
        elo: 0, level: "A1",
        reading_elo: 0, reading_level: "A1",
        vocabulary_elo: 0, vocabulary_level: "A1",
        writing_elo: 0, writing_level: "A1"
      };
    }
  },

  // Добавили аргумент section, чтобы сервер знал, какие задания давать
  getNextTask: async (section: string) => {
    const response = await axios.get("/session/exercise", {
      headers: getHeaders(),
      params: { section: section } // Передает ?section=vocabulary в URL
    });
    return response.data;
  },

  submitAnswer: async (payload: {
    exercise_id: string;
    type: string;
    answer: any;
  }) => {
    const body = {
      exercise_id: payload.exercise_id,
      type: payload.type,
      answer: payload.answer,
    };

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