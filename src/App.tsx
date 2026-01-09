import { useState, useEffect } from "react";

/* Screens */
import { ChooseLanguageScreen } from "./screens/ChooseLanguageScreen";
import { ChooseLearningLanguageScreen } from "./screens/ChooseLearningLanguageScreen";
import { ChooseLevelScreen } from "./screens/ChooseLevelScreen";
import { LevelTestScreen } from "./screens/LevelTestScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { ForgotPasswordScreen } from "./screens/ForgotPasswordScreen";
import { LessonScreen } from "./screens/LessonScreen";

/* Hooks & utils */
import { useAuth } from "./hooks/useAuth";
import { useSession } from "./hooks/useSession";
import {
  detectInitialUiLanguage,
  type UiLangCode,
} from "./utils/detectUiLanguage";
import { t } from "./i18n";

/* Styles */
import "./screens/learningPath.css";
import "./screens/lesson.css";
import "./index.css";
import "./App.css";

/* Components */
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";

type ScreenId =
  | "auth"
  | "forgot-password"
  | "choose-ui-language"
  | "choose-learning-language"
  | "choose-level"
  | "level-test"
  | "dashboard"
  | "lesson";
type AuthMode = "login" | "register";

const LANG_MAP: Record<string, string> = {
  ru: "russian",
  de: "german",
  en: "english",
  es: "spanish",
  fr: "french",
  pl: "polish",
};

const BACKEND_TO_FRONTEND_LANG: Record<string, string> = {
  Russian: "ru",
  German: "de",
  English: "en",
  Spanish: "es",
  French: "fr",
  Polish: "pl",
};

const API_URL = ""; // Vite Proxy

function App() {
  const { isAuthenticated, isLoading, login, register, logout } = useAuth();
  useSession(isAuthenticated);

  const [uiLanguage, setUiLanguage] = useState<UiLangCode>(
    () =>
      (localStorage.getItem("ui_language") as UiLangCode) ||
      detectInitialUiLanguage()
  );
  const [learningLanguage, setLearningLanguage] = useState<string | null>(() =>
    localStorage.getItem("learning_language")
  );
  const [learningLevel, setLearningLevel] = useState<string | null>(() =>
    localStorage.getItem("learning_level")
  );

  const [screen, setScreen] = useState<ScreenId>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // --- ЛОГИКА СИНХРОНИЗАЦИИ ---
  useEffect(() => {
    const syncUserData = async () => {
      if (!isAuthenticated) return;

      const localLvl = localStorage.getItem("learning_level");
      const localLang = localStorage.getItem("learning_language");

      if (localLvl && localLang) {
        setLearningLevel(localLvl);
        setLearningLanguage(localLang);
        if (screen === "auth") setScreen("dashboard");
        return;
      }

      if (screen === "auth" || screen === "choose-ui-language") {
        try {
          setIsInitializing(true);
          const token = localStorage.getItem("auth_token");
          if (!token) throw new Error("No token");

          // Получаем ID только для проверки статов, но не сохраняем его как "текущий урок"
          const sessionRes = await fetch(`${API_URL}/session/begin-session`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!sessionRes.ok) throw new Error("Session start failed");
          const sessionData = await sessionRes.json();
          const tempSessionId = sessionData.id;

          const statsRes = await fetch(`${API_URL}/user/stats`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-session-id": tempSessionId, // Используем временно
            },
          });

          if (!statsRes.ok) throw new Error("Stats fetch failed");
          const statsData = await statsRes.json();
          const langData = statsData.language_data;

          if (langData) {
            const backendLang = langData.target_language;
            const frontendLang = BACKEND_TO_FRONTEND_LANG[backendLang];
            let userLevel = "A1";
            const ratings = langData.ratings || {};
            const firstRatingKey = Object.keys(ratings)[0];
            if (firstRatingKey && ratings[firstRatingKey].cefr) {
              userLevel = ratings[firstRatingKey].cefr;
            }

            if (frontendLang) {
              setLearningLanguage(frontendLang);
              localStorage.setItem("learning_language", frontendLang);
            }
            setLearningLevel(userLevel);
            localStorage.setItem("learning_level", userLevel);
            localStorage.setItem("setup_complete", "true");
            setScreen("dashboard");
          } else {
            setScreen("choose-ui-language");
          }
        } catch (e) {
          console.warn("Sync failed, redirecting to setup:", e);
          setScreen("choose-ui-language");
        } finally {
          setIsInitializing(false);
        }
      }
    };
    syncUserData();
  }, [isAuthenticated, screen]);

  // --- ЗАПУСК УРОКА ЧЕРЕЗ СЕРВЕР ---
  const handleStartLesson = async () => {
    try {
      setIsInitializing(true); // Показываем лоадер
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No auth token");

      console.log("Creating REAL session on server...");

      // 1. Просим сервер создать сессию
      const res = await fetch(`${API_URL}/session/begin-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to create session");

      const data = await res.json();
      const realSessionId = data.id; // Айди от сервера

      if (!realSessionId) throw new Error("Server returned empty ID");

      console.log("Server assigned session ID:", realSessionId);

      localStorage.setItem("session_id", realSessionId);
      setCurrentLessonId(realSessionId);
      setScreen("lesson");
    } catch (e) {
      console.error("Lesson start error:", e);
      alert("Не удалось начать урок. Проверьте соединение.");
    } finally {
      setIsInitializing(false);
    }
  };
  // ----------------------------------------------------

  const handleRegisterFormSubmit = async (data: any) => {
    try {
      await register(data);
      setAuthMode("login");
      alert("Account created successfully! Please log in.");
    } catch (e: any) {
      alert(e.message || "Registration failed");
    }
  };

  const handleFinalizeSetup = async () => {
    const langCode = learningLanguage;
    const lvlCode = learningLevel;
    const uiCode = uiLanguage;

    if (!langCode || !lvlCode) return alert("Error: Missing data");

    setIsInitializing(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No auth token");

      const payload = {
        source_language: LANG_MAP[uiCode] || "English",
        target_language: LANG_MAP[langCode] || "English",
        language_level: lvlCode,
      };

      const res = await fetch(`${API_URL}/user/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error: ${res.status} ${errText}`);
      }

      localStorage.setItem("setup_complete", "true");
      setScreen("dashboard");
    } catch (e: any) {
      console.error(e);
      alert("Saved locally. Error: " + e.message);
      localStorage.setItem("setup_complete", "true");
      setScreen("dashboard");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleBack = () => {
    if (screen === "lesson") setScreen("dashboard");
    else if (screen === "forgot-password") setScreen("auth");
    else if (screen === "choose-learning-language")
      setScreen("choose-ui-language");
    else if (screen === "choose-level") setScreen("choose-learning-language");
    else if (screen === "level-test") setScreen("choose-level");
  };

  const showHeader = screen !== "lesson";
  const showBackButton = screen !== "auth" && screen !== "dashboard";

  if (isLoading || isInitializing)
    return <div className="loading-screen">Loading...</div>;

  return (
    <div className="app-root">
      {showHeader && (
        <header className="app-header">
          {showBackButton ? (
            <button className="app-back-button" onClick={handleBack}>
              ←
            </button>
          ) : (
            <div className="header-logo-pill">
              <div className="header-logo-circle">L</div>
              <div className="header-logo-text">LangProject</div>
            </div>
          )}
          {showBackButton && (
            <div className="header-logo-pill">
              <div className="header-logo-circle">L</div>
              <div className="header-logo-text">LangProject</div>
            </div>
          )}
        </header>
      )}

      <main
        className="app-content"
        style={screen === "lesson" ? { padding: 0 } : {}}
      >
        <div
          className="app-center-block"
          style={screen === "lesson" ? { maxWidth: "none" } : {}}
        >
          {/* ... Auth, ForgotPassword, ChooseScreens  ... */}
          {screen === "auth" && (
            <>
              <div className="page-header-block">
                <h1 className="page-title">
                  {t(uiLanguage, "auth.welcomeTitle")}
                </h1>
                <p className="page-subtitle">
                  {t(uiLanguage, "auth.welcomeSubtitle")}
                </p>
              </div>
              <div className="auth-pill-container">
                <div className="auth-tabs-pill">
                  <button
                    className={`auth-tabs-btn ${
                      authMode === "login" ? "active" : ""
                    }`}
                    onClick={() => setAuthMode("login")}
                  >
                    {t(uiLanguage, "auth.login")}
                  </button>
                  <button
                    className={`auth-tabs-btn ${
                      authMode === "register" ? "active" : ""
                    }`}
                    onClick={() => setAuthMode("register")}
                  >
                    {t(uiLanguage, "auth.signup")}
                  </button>
                </div>
              </div>
              {authMode === "login" ? (
                <LoginForm
                  uiLanguage={uiLanguage}
                  isLoading={isLoading}
                  onLogin={login}
                  onSuccess={() => {}}
                  onForgotPassword={() => setScreen("forgot-password")}
                />
              ) : (
                <RegisterForm
                  uiLanguage={uiLanguage}
                  isLoading={isLoading}
                  onRegister={handleRegisterFormSubmit}
                  onSuccess={() => {}}
                />
              )}
            </>
          )}

          {screen === "forgot-password" && (
            <ForgotPasswordScreen
              initialEmail={""}
              onBack={() => setScreen("auth")}
            />
          )}

          {screen === "choose-ui-language" && (
            <ChooseLanguageScreen
              uiLanguage={uiLanguage}
              selectedCode={uiLanguage}
              onChangeSelected={(code) => {
                setUiLanguage(code);
                localStorage.setItem("ui_language", code);
              }}
              onContinue={() => setScreen("choose-learning-language")}
            />
          )}

          {screen === "choose-learning-language" && (
            <ChooseLearningLanguageScreen
              uiLanguage={uiLanguage}
              selectedCode={learningLanguage}
              onChangeSelected={(code) => {
                setLearningLanguage(code);
                localStorage.setItem("learning_language", code);
              }}
              onContinue={() => setScreen("choose-level")}
            />
          )}

          {screen === "choose-level" && (
            <ChooseLevelScreen
              uiLanguage={uiLanguage}
              selectedLevel={learningLevel}
              onChangeSelected={(lvl) => {
                setLearningLevel(lvl);
                localStorage.setItem("learning_level", lvl);
              }}
              onContinue={handleFinalizeSetup}
              onStartTest={() => setScreen("level-test")}
            />
          )}

          {screen === "level-test" && (
            <LevelTestScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              onFinish={(lvl) => {
                setLearningLevel(lvl);
                localStorage.setItem("learning_level", lvl);
                setTimeout(handleFinalizeSetup, 100);
              }}
            />
          )}

          {screen === "dashboard" && (
            <DashboardScreen
              uiLanguage={uiLanguage}
              learningLevel={learningLevel}
              onOpenPath={(randomIdFromDashboard) => {
                handleStartLesson();
              }}
            />
          )}

          {screen === "lesson" && currentLessonId && (
            <LessonScreen
              lessonId={currentLessonId}
              onBack={() => setScreen("dashboard")}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      {screen !== "lesson" && (
        <footer className="app-footer">
          <span className="footer-text">
            © 2025 LangProject. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <a
              className="footer-link"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              LinkedIn
            </a>
            {isAuthenticated && (
              <button
                className="logout-btn"
                onClick={() => {
                  logout();
                  setScreen("auth");
                }}
              >
                LOG OUT
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
