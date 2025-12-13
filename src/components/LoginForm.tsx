// src/components/LoginForm.tsx
import React, { useState } from "react";
import type { UiLangCode } from "../utils/detectUiLanguage";
import { t } from "../i18n";

interface LoginFormProps {
  uiLanguage: UiLangCode;
  isLoading: boolean;
  onLogin: (data: { email: string; password: string }) => Promise<void> | void;
  onSuccess: () => void;
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

      await onLogin({
        email: trimmedEmail,
        password: pass,
      });

      // обновляем last_auth_email на успешный логин
      try {
        window.localStorage.setItem("last_auth_email", trimmedEmail);
      } catch {
        /* ignore */
      }

      onSuccess();
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
