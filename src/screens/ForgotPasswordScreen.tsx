import { useState } from "react";
import { PrimaryButton } from "../components/PrimaryButton";

const API_URL = "https://backend-production-bd6c.up.railway.app";

/**
 * Интерфейс пропсов для экрана запроса сброса пароля
 * @param initialEmail - необязательный email для предзаполнения
 * @param onBack - функция возврата на экран авторизации
 */
interface ForgotPasswordScreenProps {
  initialEmail?: string;
  onBack: () => void;
}

/**
 * Компонент экрана "Забыл пароль"
 */
export const ForgotPasswordScreen = ({
  initialEmail,
  onBack,
}: ForgotPasswordScreenProps) => {
  /** Состояние для хранения введенного пользователем email */
  const [email, setEmail] = useState(initialEmail ?? "");
  /** Состояние для отслеживания успешной отправки запроса */
  const [isSent, setIsSent] = useState(false);

  /**
   * Функция обработки отправки формы.
   * Выполняет POST запрос к API для генерации ссылки сброса.
   */
  const handleSubmit = async () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/reset-password-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSent(true);
      } else {
        alert("Пользователь с таким email не найден или произошла ошибка.");
      }
    } catch (e) {
      alert("Ошибка соединения с сервером.");
    }
  };

  // Если письмо успешно отправлено, показываем подтверждение
  if (isSent) {
    return (
      <div className="auth-container">
        <div className="page-title">Check your email</div>
        <p className="page-subtitle">We've sent a reset link to <b>{email}</b>.</p>
        <PrimaryButton onClick={onBack}>Back to login</PrimaryButton>
      </div>
    );
  }

  return (
    <>
      <div className="page-title">Reset password</div>
      <p className="page-subtitle">
        Enter the email you used to create your account – we'll send you a reset
        link.
      </p>

      <div className="auth-field">
        <label className="auth-label">Email</label>
        <input
          className="auth-input"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <PrimaryButton onClick={handleSubmit} disabled={!email}>
        Send reset link
      </PrimaryButton>

      <button
        className="auth-forgot"
        onClick={onBack}
        style={{ marginTop: "20px" }}
      >
        Back to login
      </button>
    </>
  );
};