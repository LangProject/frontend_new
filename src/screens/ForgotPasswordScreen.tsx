import { useState } from "react";
import { PrimaryButton } from "../components/PrimaryButton";
import { t } from "../i18n";
import type { UiLangCode } from "../utils/detectUiLanguage";

interface ForgotPasswordScreenProps {
  uiLanguage: UiLangCode;
  onSendReset: (email: string) => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  uiLanguage,
  onSendReset,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState("");

  const isValid = email.includes("@");

  const handleSubmit = () => {
    if (!isValid) return;
    onSendReset(email);
  };

  return (
    <>
      <div className="page-title">Reset password</div>
      <p className="page-subtitle">
        Enter the email connected to your account.
      </p>

      <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="button"
          className="auth-submit"
          disabled={!isValid}
          onClick={handleSubmit}
        >
          Send reset email
        </button>

        <button type="button" className="auth-forgot" onClick={onBackToLogin}>
          Back to login
        </button>
      </form>
    </>
  );
};
