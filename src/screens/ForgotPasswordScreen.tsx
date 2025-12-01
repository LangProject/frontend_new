import { useState } from "react";
import { PrimaryButton } from "../components/PrimaryButton";

interface ForgotPasswordScreenProps {
  initialEmail?: string;
  onBack: () => void;
}

export const ForgotPasswordScreen = ({
  initialEmail,
  onBack,
}: ForgotPasswordScreenProps) => {
  const [email, setEmail] = useState(initialEmail ?? "");

  const handleSubmit = () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    alert(
      `If an account exists for ${email}, we’ll send password reset instructions.`
    );
    onBack();
  };

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
