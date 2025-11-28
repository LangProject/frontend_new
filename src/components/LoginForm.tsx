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

const validateEmail = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your email.";
  const simple = /\S+@\S+\.\S+/;
  if (!simple.test(trimmed)) return "Please enter a valid email.";
  return "";
};

const validatePassword = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your password.";
  if (trimmed.length < 6) return "Password must be at least 6 characters.";
  return "";
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

  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);

  const emailError = touchedEmail ? validateEmail(email) : "";
  const passwordError = touchedPassword ? validatePassword(password) : "";

  const isFormValid = !validateEmail(email) && !validatePassword(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouchedEmail(true);
    setTouchedPassword(true);

    if (!isFormValid) return;

    await onLogin({ email: email.trim(), password: password.trim() });
    onSuccess();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-field">
        <input
          type="email"
          className={"auth-input" + (emailError ? " auth-input-error" : "")}
          placeholder={t(uiLanguage, "auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouchedEmail(true)}
          required
        />
        {emailError && <div className="auth-error">{emailError}</div>}
      </div>

      <div className="auth-field">
        <input
          type="password"
          className={"auth-input" + (passwordError ? " auth-input-error" : "")}
          placeholder={t(uiLanguage, "auth.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouchedPassword(true)}
          required
          minLength={6}
        />
        {passwordError && <div className="auth-error">{passwordError}</div>}
      </div>

      <button
        type="submit"
        className="auth-submit"
        disabled={isLoading || !isFormValid}
        aria-disabled={isLoading || !isFormValid}
      >
        {isLoading ? "…" : t(uiLanguage, "auth.loginButton")}
      </button>

      <button
        type="button"
        className="auth-forgot"
        onClick={() => onForgotPassword(email)}
      >
        {t(uiLanguage, "auth.forgotPassword")}
      </button>
    </form>
  );
};
