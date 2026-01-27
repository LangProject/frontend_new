// src/components/LoginForm.tsx
import React, { useState } from "react";
import type { UiLangCode } from "../utils/detectUiLanguage";
import { t } from "../i18n";

// 1. Интерфейс ответа
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    name: string;
    email: string;
    is_initialized: boolean;
  };
}

interface LoginFormProps {
  uiLanguage: UiLangCode;
  isLoading: boolean;
  onLogin: (data: { email: string; password: string }) => Promise<LoginResponse | void>;
  // ВАЖНО: Мы обязуемся передать user в эту функцию
  onSuccess: (user: { is_initialized: boolean }) => void;
  onForgotPassword: (email: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  uiLanguage,
  isLoading,
  onLogin,
  onSuccess,
  onForgotPassword,
}) => {
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem("last_auth_email") ?? "";
    } catch {
      return "";
    }
  });
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValid = email.includes("@") && pass.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setError(null);

    try {
      const trimmedEmail = email.trim();
      const response = await onLogin({ email: trimmedEmail, password: pass });

      // Сохраняем email для удобства (автозаполнение при след. входе)
      try {
        window.localStorage.setItem("last_auth_email", trimmedEmail);
      } catch { /* ignore */ }

      // 4. ГЛАВНАЯ ЛОГИКА
      // Проверяем, что ответ пришел и в нем есть данные
      // @ts-ignore (игнорируем строгие проверки TS, если типы не совпадают идеально)
      if (response && response.access_token && response.user) {
        try {
          // Сохраняем ТОЛЬКО токены
          window.localStorage.setItem("access_token", response.access_token);
          window.localStorage.setItem("refresh_token", response.refresh_token);
          
          // Удаляем ID сессии, чтобы сбросить старый контекст чата
          window.localStorage.removeItem("session_id"); 
          
          // ВАЖНО: Мы НЕ сохраняем is_initialized в localStorage.
          // Мы передаем данные напрямую в App.tsx через onSuccess.
          
          onSuccess(response.user); 

        } catch (storageErr) {
          console.error("Failed to save auth data", storageErr);
        }
      }
      
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Incorrect email or password.");
    }
  };

  const handleForgot = () => {
    onForgotPassword(email.trim());
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-label">
        {t(uiLanguage, "auth.email") ?? "Email"}
        <input
          className="auth-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>

      <label className="auth-label">
        {t(uiLanguage, "auth.password") ?? "Password"}
        <input
          className="auth-input"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Enter your password"
        />
      </label>

      <button type="button" className="auth-forgot" onClick={handleForgot}>
        {t(uiLanguage, "auth.forgotPassword") ?? "Forgot password?"}
      </button>

      {error && <div className="auth-error">{error}</div>}

      <button
        type="submit"
        className="primary-btn auth-submit"
        disabled={!isValid || isLoading}
      >
        {isLoading
          ? t(uiLanguage, "auth.loading") ?? "Please wait..."
          : t(uiLanguage, "auth.logInCta") ?? "Log in"}
      </button>
    </form>
  );
};