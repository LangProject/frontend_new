// src/hooks/useAuth.ts
import { useState } from "react";
import {
  apiLogin,
  apiRegister,
  type LoginPayload,
  type RegisterPayload,
} from "../types/auth.ts";

const SESSION_TTL_MS = 10 * 60 * 1000; // 10 минут

function getInitialToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const token = window.localStorage.getItem("token");
    const issuedAtStr = window.localStorage.getItem("token_issued_at");

    if (!token || !issuedAtStr) return null;

    const issuedAt = Number(issuedAtStr);
    if (!Number.isFinite(issuedAt)) {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("token_issued_at");
      return null;
    }

    const now = Date.now();
    if (now - issuedAt > SESSION_TTL_MS) {
      // сессия протухла
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("token_issued_at");
      return null;
    }

    return token;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(() => getInitialToken());

  const login = async (data: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(data);

      const now = Date.now().toString();
      window.localStorage.setItem("token", res.token);
      window.localStorage.setItem("token_issued_at", now);
      setToken(res.token);

      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await apiRegister(data);

      const now = Date.now().toString();
      window.localStorage.setItem("token", res.token);
      window.localStorage.setItem("token_issued_at", now);
      setToken(res.token);

      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("token_issued_at");
    } catch {
      /* ignore */
    }
    setToken(null);
  };

  return {
    login,
    register,
    logout,
    token,
    isLoading,
    isAuthenticated: Boolean(token),
  };
}
