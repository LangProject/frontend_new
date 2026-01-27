import { useState, useEffect } from "react";
import { PrimaryButton } from "../components/PrimaryButton";
import { API_URL } from "../config";

/**
 * Интерфейс пропсов для экрана установки нового пароля
 * @param onSuccess - действие при успешной смене пароля
 * @param onBack - возврат назад
 */
interface ResetPasswordScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

/**
 * Компонент экрана установки нового пароля
 */
export const ResetPasswordScreen = ({ onSuccess, onBack }: ResetPasswordScreenProps) => {
  /** Email пользователя (требуется бэкендом в схеме AuthCredentials) */
  const [email, setEmail] = useState("");
  /** Новый пароль */
  const [password, setPassword] = useState("");
  /** Токен, полученный из URL */
  const [token, setToken] = useState("");

  /**
   * Эффект для извлечения токена из URL при загрузке компонента
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, []);

  /**
   * Обработка сброса пароля. Отправляет данные на бэкенд.
   */
  const handleReset = async () => {
    try {
      // Согласно Swagger: токен в query-параметрах, email и пароль в body
      const response = await fetch(`${API_URL}/auth/reset-password?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        alert("Пароль успешно обновлен!");
        // Очищаем URL от токена, чтобы не возвращаться сюда случайно
        window.history.replaceState({}, document.title, window.location.pathname);
        onSuccess();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.detail || "Ошибка при смене пароля.");
      }
    } catch (e) {
      alert("Ошибка сети.");
    }
  };

  return (
    <div className="auth-container">
      <div className="page-title">Set New Password</div>
      <p className="page-subtitle">Please enter your email and a new secure password.</p>

      <div className="auth-field">
        <label className="auth-label">Confirm Email</label>
        <input
          className="auth-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
        />
      </div>

      <div className="auth-field">
        <label className="auth-label">New Password</label>
        <input
          className="auth-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
        />
      </div>

      <PrimaryButton 
        onClick={handleReset} 
        disabled={!email || password.length < 8 || !token}
      >
        Update Password
      </PrimaryButton>

      <button className="auth-forgot" onClick={onBack} style={{ marginTop: "20px" }}>
        Back to login
      </button>
    </div>
  );
};