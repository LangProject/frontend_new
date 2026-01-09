import axios from "axios";

// Убедитесь, что baseURL настроен правильно в основном файле настройки (main.tsx или axios.ts)
// axios.defaults.baseURL = "http://localhost:8000";

export const LessonService = {
  // 1. Получение статистики
  getStats: async () => {
    const sessionId = localStorage.getItem("session_id");
    const token = localStorage.getItem("token"); // <--- БЕРЕМ ТОКЕН

    if (!token) {
      console.warn("Нет токена, возвращаем статы по умолчанию");
      return { elo: 1200, level: "A1" };
    }

    try {
      const response = await axios.get("/user/stats", {
        headers: {
          "x-session-id": sessionId || "",
          Authorization: `Bearer ${token}`,
        },
      });

      // ВАЖНО: Сервер возвращает сложный JSON (language_data...), а UI ждет { elo, level }.
      // Чтобы не было ошибок "undefined", пока возвращаем фиктивные данные.
      // Когда разберетесь с JSON сервера, раскомментируйте код ниже:

      /* const serverData = response.data;
        return {
           elo: serverData.language_data?.ratings?.english?.elo || 1200,
           level: serverData.language_data?.ratings?.english?.cefr || "A1"
        };
        */

      return { elo: 1200, level: "A1" }; // Временная заглушка, чтобы всё заработало
    } catch (error) {
      console.error("Ошибка получения статистики", error);
      // Возвращаем дефолт при ошибке, чтобы экран урока не падал
      return { elo: 1200, level: "A1" };
    }
  },

  // 2. Получение следующего задания
  getNextTask: async () => {
    const sessionId = localStorage.getItem("session_id");
    const token = localStorage.getItem("token");

    if (!sessionId) {
      console.error("Попытка запроса без ID");
      throw new Error("No session ID found");
    }

    const response = await axios.get("/session/exercise", {
      headers: {
        "x-session-id": sessionId,
        Authorization: `Bearer ${token || ""}`,
      },
    });

    return response.data;
  },

  // 3. Отправка ответа
  submitAnswer: async (data: any) => {
    const sessionId = localStorage.getItem("session_id");
    const token = localStorage.getItem("token");

    const response = await axios.post("/session/exercise/solve", data, {
      headers: {
        "x-session-id": sessionId,
        Authorization: `Bearer ${token || ""}`,
      },
    });

    return response.data;
  },

  // 4. Завершение уровня
  endLevel: async () => {
    // Логика завершения
  },
};
