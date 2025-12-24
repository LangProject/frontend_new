// src/hooks/useSession.ts
import { useState, useEffect } from "react";
import { api } from "../utils/api";

export function useSession(isAuthenticated: boolean) {
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem("session_id")
  );

  useEffect(() => {
    // Если пользователь вошел, но сессии нет — создаем её
    const initSession = async () => {
      if (isAuthenticated && !sessionId) {
        try {
          console.log("🔄 Starting new learning session...");
          const data = await api.startSession();

          if (data.id) {
            console.log("✅ Session started:", data.id);
            localStorage.setItem("session_id", data.id);
            setSessionId(data.id);
          }
        } catch (e) {
          console.error("Failed to start session:", e);
        }
      }
    };

    initSession();
  }, [isAuthenticated, sessionId]);

  return { sessionId };
}
