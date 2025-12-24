import { useState, useEffect } from "react";

// Оставляем пустым, так как работает прокси
const API_URL = "";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const savedEmail = localStorage.getItem("user_email");

    if (token) {
      setIsAuthenticated(true);
      if (savedEmail) setUser({ email: savedEmail });
    }
    setIsLoading(false);
  }, []);

  const login = async (data: any) => {
    setIsLoading(true);
    try {
      // 🔥 ИСПРАВЛЕНИЕ: Бэкенд ждет JSON на /auth/login
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        // Swagger говорит, что ошибка будет в detail
        throw new Error(err.detail?.[0]?.msg || err.detail || "Login failed");
      }

      const resData = await response.json();

      // Swagger: TokensIssue { access_token, refresh_token, user: {name, email} }
      const token = resData.access_token;

      if (!token) throw new Error("No token received");

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_email", data.email);

      setUser({ email: data.email });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      // 🔥 ИСПРАВЛЕНИЕ: Путь /auth/register и поля { name, email, password }
      // Мы объединяем fullName и nickname в одно поле 'name', так как бэк ждет только 'name'
      const finalName = data.fullName || data.nickname || "User";

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalName,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        // Обработка ошибок валидации Pydantic
        const errorMsg = Array.isArray(err.detail)
          ? err.detail.map((e: any) => e.msg).join(", ")
          : err.detail;
        throw new Error(errorMsg || "Registration failed");
      }

      // Успешная регистрация
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Опционально можно дернуть /auth/logout, но для JWT достаточно чистки localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("setup_complete");
    localStorage.removeItem("learning_level");
    localStorage.removeItem("learning_language");

    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, isLoading, user, login, register, logout };
};
