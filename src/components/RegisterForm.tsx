import { useState } from "react";
import { t } from "../i18n";
import type { UiLangCode } from "../utils/detectUiLanguage";

type RegisterFormProps = {
  uiLanguage: UiLangCode;
  onRegister: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void> | void;
  isLoading: boolean;
  onSuccess: () => void;
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

const validateName = (value: string): string => {
  if (!value.trim()) return "Please enter your name.";
  return "";
};

export const RegisterForm: React.FC<RegisterFormProps> = ({
  uiLanguage,
  onRegister,
  isLoading,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [touchedName, setTouchedName] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);

  const nameError = touchedName ? validateName(name) : "";
  const emailError = touchedEmail ? validateEmail(email) : "";
  const passwordError = touchedPassword ? validatePassword(password) : "";

  const isFormValid =
    !validateName(name) && !validateEmail(email) && !validatePassword(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouchedName(true);
    setTouchedEmail(true);
    setTouchedPassword(true);

    if (!isFormValid) return;

    await onRegister({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
    });
    onSuccess();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-field">
        <input
          type="text"
          className={"auth-input" + (nameError ? " auth-input-error" : "")}
          placeholder={t(uiLanguage, "auth.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouchedName(true)}
          required
        />
        {nameError && <div className="auth-error">{nameError}</div>}
      </div>

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
        {isLoading ? "…" : t(uiLanguage, "auth.createAccountButton")}
      </button>
    </form>
  );
};
