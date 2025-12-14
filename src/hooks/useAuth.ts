// src/hooks/useAuth.ts
import { useState, useEffect } from "react";

// Имитация задержки (как будто запрос на сервер)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useAuth() {
  // Сразу проверяем localStorage, чтобы не было мигания
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("auth_token");
  });

  const [isLoading, setIsLoading] = useState(false);

  // Функция входа
  const login = async (data: any) => {
    setIsLoading(true);
    await delay(1000); // Имитация сети

    localStorage.setItem("auth_token", "fake-jwt-token"); // Сохраняем "токен"
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  // Функция регистрации
  const register = async (data: any) => {
    setIsLoading(true);
    await delay(1000);

    localStorage.setItem("auth_token", "fake-jwt-token");
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  // Функция выхода
  const logout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    // Можно добавить перезагрузку страницы, чтобы очистить все состояния
    window.location.reload();
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
}
