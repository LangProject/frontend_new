import { useState, useEffect } from "react";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth";

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setUser({
        id: "1",
        email: "user@example.com",
        name: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Logging in with:", credentials);

      // простая мок-логика: любой логин успешный
      const mockUser: User = {
        id: "1",
        email: credentials.email,
        name: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorage.setItem("auth_token", "mock-token");
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Registering with:", credentials);

      const mockUser: User = {
        id: "1",
        email: credentials.email,
        name: credentials.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorage.setItem("auth_token", "mock-token");
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };
};
