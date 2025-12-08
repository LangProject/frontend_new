// src/components/RegisterForm.tsx
import React, { useState } from "react";
import type { UiLangCode } from "../utils/detectUiLanguage";
import { t } from "../i18n";

interface RegisterFormProps {
  uiLanguage: UiLangCode;
  isLoading: boolean;
  onRegister: (data: {
    fullName: string;
    nickname: string;
    email: string;
    password: string;
  }) => Promise<void> | void;
  // КОГДА регистрация прошла успешно — вызываем это,
  // App переключит нас на экран логина
  onSuccess: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  uiLanguage,
  isLoading,
  onRegister,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValid =
    fullName.trim().length > 1 &&
    nickname.trim().length > 1 &&
    email.includes("@") &&
    pass1.length >= 6 &&
    pass1 === pass2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setError(null);

    try {
      const trimmedEmail = email.trim();

      await onRegister({
        fullName: fullName.trim(),
        nickname: nickname.trim(),
        email: trimmedEmail,
        password: pass1,
      });

      // 💾 сохраняем email для автоподстановки на странице логина
      try {
        window.localStorage.setItem("last_auth_email", trimmedEmail);
      } catch {
        // игнорируем ошибки доступа к localStorage
      }

      // сообщаем App, что всё ок — он переключит нас на Login
      onSuccess();
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="auth-label">
        {t(uiLanguage, "auth.fullName") ?? "Full name"}
        <input
          className="auth-input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder=""
        />
      </label>

      <label className="auth-label">
        {t(uiLanguage, "auth.nickname") ?? "Nickname"}
        <input
          className="auth-input"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder=""
        />
      </label>

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
          value={pass1}
          onChange={(e) => setPass1(e.target.value)}
          placeholder=""
        />
      </label>

      <label className="auth-label">
        {t(uiLanguage, "auth.repeatPassword") ?? "Repeat password"}
        <input
          className="auth-input"
          type="password"
          value={pass2}
          onChange={(e) => setPass2(e.target.value)}
          placeholder=""
        />
      </label>

      {error && <div className="auth-error">{error}</div>}

      <button
        type="submit"
        className="primary-btn auth-submit"
        disabled={!isValid || isLoading}
      >
        {isLoading
          ? t(uiLanguage, "auth.loading") ?? "Please wait..."
          : t(uiLanguage, "auth.signUpCta") ?? "Create account"}
      </button>
    </form>
  );
};
