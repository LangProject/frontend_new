import axios from "axios";

/**
 * Формирует заголовки с токеном и ID сессии из localStorage.
 */
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
  /**
   * Получение статистики пользователя.
   */
  async getStats() {
    try {
      const response = await axios.get("/user/stats", {
        headers: getHeaders(),
      });
      const data = response.data;

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
        
        if (ratings.language_level) {
          result.elo = Math.round(ratings.language_level.elo || 0);
          result.level = ratings.language_level.cefr || "A1";
        } else {
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

  /**
   * Запрос нового задания.
   */
  async getNextTask(section: string) {
    const response = await axios.get("/session/exercise", {
      headers: getHeaders(),
      params: { section }
    });
    return response.data;
  },

  /**
   * Отправка ответа.
   */
  async submitAnswer(payload: { exercise_id: string; type: string; answer: any }) {
    try {
      const response = await axios.post("/session/answer", payload, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        console.error("SERVER ERROR:", JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  },

  
  async endLevel() {
    try {
      const response = await axios.post("/session/end-level", null, { 
        headers: getHeaders() 
      });
      return response.data;
    } catch (error) {
      console.error("End level failed:", error);
      throw error;
    }
  }
};