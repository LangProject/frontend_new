import { useState, type FC } from "react";
import type { LoginCredentials } from "../types/auth";

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  onSuccess: () => void;
  onForgotPassword: (email: string) => void;
}

interface LoginErrors {
  email?: string;
  password?: string;
  root?: string;
}

export const LoginForm: FC<LoginFormProps> = ({
  onLogin,
  isLoading,
  onSuccess,
  onForgotPassword,
}) => {
  const [form, setForm] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});

  const validate = (): boolean => {
    const newErrors: LoginErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!form.email.includes("@")) {
      newErrors.email = "Email is invalid";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid =
    form.email.trim().length > 0 &&
    form.email.includes("@") &&
    form.password.trim().length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setErrors({});
      await onLogin(form);
      onSuccess();
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        root: "Login failed. Please try again.",
      }));
    }
  };

  const handleForgotClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onForgotPassword(form.email);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-field">
        <input
          className="auth-input"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.email && <div className="auth-error">{errors.email}</div>}
      </div>

      <div className="auth-field">
        <input
          className="auth-input"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.password && <div className="auth-error">{errors.password}</div>}
      </div>

      {errors.root && (
        <div className="auth-error auth-error-root">{errors.root}</div>
      )}

      <button
        type="submit"
        className="auth-submit"
        disabled={isLoading || !isFormValid}
      >
        {isLoading ? "Logging in..." : "Log in"}
      </button>

      <button
        type="button"
        className="auth-forgot"
        onClick={handleForgotClick}
        disabled={isLoading}
      >
        Forgot password?
      </button>
    </form>
  );
};
