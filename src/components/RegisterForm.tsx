import { useState, type FC } from "react";
import type { RegisterCredentials } from "../types/auth";

interface RegisterFormProps {
  onRegister: (credentials: RegisterCredentials) => Promise<void>;
  isLoading: boolean;
  onSuccess: () => void;
}

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  root?: string;
}

export const RegisterForm: FC<RegisterFormProps> = ({
  onRegister,
  isLoading,
  onSuccess,
}) => {
  const [form, setForm] = useState<RegisterCredentials>({
    email: "",
    password: "",
    name: "",
  });

  const [errors, setErrors] = useState<RegisterErrors>({});

  const validate = (): boolean => {
    const newErrors: RegisterErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!form.email.includes("@")) {
      newErrors.email = "Email is invalid";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.email.includes("@") &&
    form.password.trim().length >= 6;

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
      await onRegister(form);
      onSuccess();
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        root: "Registration failed. Please try again.",
      }));
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-field">
        <input
          className="auth-input"
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.name && <div className="auth-error">{errors.name}</div>}
      </div>

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
        {isLoading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
};
