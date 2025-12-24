// src/utils/api.ts

const BASE_URL = "http://127.0.0.1:8000";

// Типы ошибок для удобства
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 1. Достаем ключи из хранилища
  const token = localStorage.getItem("auth_token");
  const sessionId = localStorage.getItem("session_id");

  // ОТЛАДКА: Пишем в консоль, что мы нашли
  console.log(
    `📡 Request to ${endpoint} | Token: ${!!token} | SessionId: ${sessionId}`
  );

  // 2. Формируем заголовки
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...((options.headers as any) || {}),
  };

  // Добавляем токен авторизации
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 🔥 ВАЖНО: Добавляем ID сессии, если он есть
  if (sessionId) {
    headers["x-session-id"] = sessionId;
  }

  // 3. Делаем запрос
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 4. Обрабатываем ошибки
  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Unauthorized! Token might be expired.");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || response.statusText
    );
  }

  return response.json();
}

// --- API МЕТОДЫ ---
export const api = {
  getProfile: () => request<any>("/user/me"),
  startSession: () =>
    request<{ id: string }>("/session/begin-session", { method: "POST" }),
  getNextExercise: () => request<any>("/session/exercise"),
  generateTask: (type: string, params: any) =>
    request(`/ai/${type}`, {
      method: "POST",
      body: JSON.stringify(params),
    }),
};
