import { useState } from "react";
import { t } from "../i18n";
import type { UiLangCode } from "../utils/detectUiLanguage";

type LoginFormProps = {
  uiLanguage: UiLangCode;
  onLogin: (data: { email: string; password: string }) => Promise<void> | void;
  isLoading: boolean;
  onSuccess: () => void;
  onForgotPassword: (email: string) => void;
};

export const LoginForm: React.FC<LoginFormProps> = ({
  uiLanguage,
  onLogin,
  isLoading,
  onSuccess,
  onForgotPassword,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isFormValid = email.trim() !== "" && password.trim().length >= 6; // ← проверка длины

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;

    await onLogin({ email, password });
    onSuccess();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        type="email"
        className="auth-input"
        placeholder={t(uiLanguage, "auth.emailPlaceholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        className="auth-input"
        placeholder={t(uiLanguage, "auth.passwordPlaceholder")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6} // ← HTML-валидация
      />

      <button
        type="submit"
        className="primary-button"
        disabled={isLoading || !isFormValid}
        aria-disabled={isLoading || !isFormValid}
      >
        {isLoading ? "…" : t(uiLanguage, "auth.loginButton")}
      </button>

      <button
        type="button"
        className="link-button"
        onClick={() => onForgotPassword(email)}
      >
        {t(uiLanguage, "auth.forgotPassword")}
      </button>
    </form>
  );
};
