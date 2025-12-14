import { useState, useEffect } from "react";

/* Screens */
import { ChooseLanguageScreen } from "./screens/ChooseLanguageScreen";
import { ChooseLearningLanguageScreen } from "./screens/ChooseLearningLanguageScreen";
import { ChooseLevelScreen } from "./screens/ChooseLevelScreen";
import { LevelTestScreen } from "./screens/LevelTestScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { ForgotPasswordScreen } from "./screens/ForgotPasswordScreen";
import { LearningPathDetailsScreen } from "./screens/LearningPathDetailsScreen";
import { LessonScreen } from "./screens/LessonScreen";

/* Styles */
import "./screens/learningPath.css";
import "./screens/lesson.css";
import "./index.css";
import "./App.css";

/* Components */
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";

/* Hooks & utils */
import { useAuth } from "./hooks/useAuth";
import {
  detectInitialUiLanguage,
  type UiLangCode,
} from "./utils/detectUiLanguage";
import { t } from "./i18n";

type ScreenId =
  | "auth"
  | "forgot-password"
  | "choose-ui-language"
  | "choose-learning-language"
  | "choose-level"
  | "level-test"
  | "dashboard"
  | "path-details"
  | "lesson";

type AuthMode = "login" | "register";

function App() {
  const [uiLanguage, setUiLanguage] = useState<UiLangCode>(
    detectInitialUiLanguage()
  );

  const [learningLanguage, setLearningLanguage] = useState<string | null>(null);
  const [learningLevel, setLearningLevel] = useState<string | null>(null);

  const { isAuthenticated, isLoading, login, register, logout } = useAuth();

  const [screen, setScreen] = useState<ScreenId>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [forgotEmail, setForgotEmail] = useState<string>("");

  const [currentPathId, setCurrentPathId] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  // --- УСТАНОВКА УРОВНЯ ---
  const handleSetLevel = (level: string) => {
    const formattedLevel = level.toUpperCase();
    setLearningLevel(formattedLevel);
    localStorage.setItem("learning_level", formattedLevel);
  };

  // --- ЗАПУСК ---
  useEffect(() => {
    if (isAuthenticated && screen === "auth") {
      const isSetupComplete = localStorage.getItem("setup_complete");

      // Восстанавливаем уровень
      const savedLevel = localStorage.getItem("learning_level");
      if (savedLevel) setLearningLevel(savedLevel);

      if (isSetupComplete === "true") {
        setScreen("dashboard");
      } else {
        setScreen("choose-ui-language");
      }
    }
  }, [isAuthenticated, screen]);

  const handleFinishSetup = () => {
    localStorage.setItem("setup_complete", "true");
    setScreen("dashboard");
  };

  /* ---------- NAV ---------- */
  const handleBack = () => {
    switch (screen) {
      case "forgot-password":
        setScreen("auth");
        break;
      case "choose-learning-language":
        setScreen("choose-ui-language");
        break;
      case "choose-level":
        setScreen("choose-learning-language");
        break;
      case "level-test":
        setScreen("choose-level");
        break;
      case "path-details":
        setScreen("dashboard");
        break;
      case "lesson":
        setScreen("path-details");
        break;
      default:
        break;
    }
  };

  /* ---------- AUTH ---------- */
  const handleLogin = async (data: { email: string; password: string }) => {
    await login(data);
  };

  const handleRegister = async (data: {
    fullName: string;
    nickname: string;
    email: string;
    password: string;
  }) => {
    const displayName = data.fullName || data.nickname;
    await register({
      email: data.email,
      password: data.password,
      name: displayName,
    });
    localStorage.removeItem("setup_complete");
    setScreen("choose-ui-language");
  };

  /* ---------- HANDLERS ---------- */
  const handleUiLanguageSelected = (lang: UiLangCode) => {
    setUiLanguage(lang);
    localStorage.setItem("ui_language", lang);
  };

  const handleOpenPath = (pathId: string) => {
    setCurrentPathId(pathId);
    setScreen("path-details");
  };

  const handleStartLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setScreen("lesson");
  };

  if (isLoading) {
    return (
      <div
        className="loading-screen"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#58cc02",
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        Loading...
      </div>
    );
  }

  const showBackButton =
    screen !== "auth" &&
    screen !== "dashboard" &&
    screen !== "choose-ui-language";

  return (
    <div className="app-root">
      <header className="app-header">
        {showBackButton && (
          <button className="app-back-button" onClick={handleBack}>
            ←
          </button>
        )}
        <div className="app-header-logo">
          <span className="app-header-logo-badge">L</span>
          <span>LangProject</span>
        </div>
      </header>

      <main className="app-content">
        <div className="app-center-block">
          {screen === "auth" && (
            <>
              <div className="page-title">
                {t(uiLanguage, "auth.welcomeTitle")}
              </div>
              <p className="page-subtitle">
                {t(uiLanguage, "auth.welcomeSubtitle")}
              </p>
              <div className="auth-tabs-switch">
                <button
                  className={
                    authMode === "login"
                      ? "auth-tabs-btn auth-tabs-btn-active"
                      : "auth-tabs-btn"
                  }
                  onClick={() => setAuthMode("login")}
                >
                  Log in
                </button>
                <button
                  className={
                    authMode === "register"
                      ? "auth-tabs-btn auth-tabs-btn-active"
                      : "auth-tabs-btn"
                  }
                  onClick={() => setAuthMode("register")}
                >
                  Sign up
                </button>
              </div>
              {authMode === "login" ? (
                <LoginForm
                  uiLanguage={uiLanguage}
                  isLoading={isLoading}
                  onLogin={handleLogin}
                  onSuccess={() => {}}
                  onForgotPassword={(email) => {
                    setForgotEmail(email);
                    setScreen("forgot-password");
                  }}
                />
              ) : (
                <RegisterForm
                  uiLanguage={uiLanguage}
                  isLoading={isLoading}
                  onRegister={handleRegister}
                  onSuccess={() => {}}
                />
              )}
            </>
          )}

          {screen === "forgot-password" && (
            <ForgotPasswordScreen
              initialEmail={forgotEmail}
              onBack={() => setScreen("auth")}
            />
          )}

          {screen === "choose-ui-language" && (
            <ChooseLanguageScreen
              uiLanguage={uiLanguage}
              selectedCode={uiLanguage}
              onChangeSelected={(code) =>
                handleUiLanguageSelected(code as UiLangCode)
              }
              onContinue={() => setScreen("choose-learning-language")}
            />
          )}

          {screen === "choose-learning-language" && (
            <ChooseLearningLanguageScreen
              uiLanguage={uiLanguage}
              selectedCode={learningLanguage}
              onChangeSelected={setLearningLanguage}
              onContinue={() => setScreen("choose-level")}
            />
          )}

          {screen === "choose-level" && (
            <ChooseLevelScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              selectedLevel={learningLevel}
              onChangeSelected={handleSetLevel}
              onContinue={handleFinishSetup}
              onStartTest={() => setScreen("level-test")}
            />
          )}

          {screen === "level-test" && (
            <LevelTestScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              onFinish={(lvl) => {
                handleSetLevel(lvl);
                handleFinishSetup();
              }}
            />
          )}

          {/* 👇 Здесь мы передаем learningLevel в Dashboard */}
          {screen === "dashboard" && (
            <DashboardScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              learningLevel={learningLevel}
              onOpenPath={handleOpenPath}
            />
          )}

          {/* 👇 ИСПРАВЛЕНИЕ: Теперь передаем learningLevel в LearningPathDetailsScreen */}
          {screen === "path-details" && currentPathId && (
            <LearningPathDetailsScreen
              pathId={currentPathId}
              // Передаем выбранный уровень
              learningLevel={learningLevel}
              onBack={() => setScreen("dashboard")}
              onStartLesson={handleStartLesson}
            />
          )}

          {screen === "lesson" && currentLessonId && (
            <LessonScreen
              lessonId={currentLessonId}
              onBack={() => setScreen("path-details")}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <span>© 2025 LangProject</span>
        {isAuthenticated && (
          <button
            className="logout-link"
            onClick={() => {
              logout();
              setScreen("auth");
            }}
          >
            Log out
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;
