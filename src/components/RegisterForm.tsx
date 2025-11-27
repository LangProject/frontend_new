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

export const RegisterForm: React.FC<RegisterFormProps> = ({
  uiLanguage,
  onRegister,
  isLoading,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isFormValid =
    name.trim() !== "" && email.trim() !== "" && password.trim().length >= 6; // ← проверка длины

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;

    await onRegister({ name, email, password });
    onSuccess();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="auth-input"
        placeholder={t(uiLanguage, "auth.namePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

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
        {isLoading ? "…" : t(uiLanguage, "auth.createAccountButton")}
      </button>
    </form>
  );
};
