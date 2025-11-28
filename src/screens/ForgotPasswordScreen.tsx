import { useState } from "react";
import type { UiLangCode } from "../utils/detectUiLanguage";

interface ForgotPasswordScreenProps {
  uiLanguage: UiLangCode;
  onSendReset: (email: string) => void;
  onBackToLogin: () => void;
}

const validateEmail = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your email.";
  const simple = /\S+@\S+\.\S+/;
  if (!simple.test(trimmed)) return "Please enter a valid email.";
  return "";
};

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onSendReset,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const emailError = touched ? validateEmail(email) : "";
  const isValid = !validateEmail(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const err = validateEmail(email);
    if (err) return;

    onSendReset(email.trim());
    setIsSent(true);
    setSubmittedEmail(email.trim());
  };

  if (isSent && submittedEmail) {
    return (
      <>
        <div className="page-title">Check your inbox</div>
        <p className="page-subtitle">
          We’ve sent a password reset link to <br />
          <strong>{submittedEmail}</strong>.
        </p>

        <button type="button" className="auth-submit" onClick={onBackToLogin}>
          Back to login
        </button>
      </>
    );
  }

  return (
    <>
      <div className="page-title">Reset password</div>
      <p className="page-subtitle">
        Enter the email connected to your account.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <input
            type="email"
            className={"auth-input" + (emailError ? " auth-input-error" : "")}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
          />
          {emailError && <div className="auth-error">{emailError}</div>}
        </div>

        <button
          type="submit"
          className="auth-submit"
          disabled={!isValid}
          aria-disabled={!isValid}
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
