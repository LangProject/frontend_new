// src/App.tsx
import { useState } from "react";
import { ChooseLanguageScreen } from "./screens/ChooseLanguageScreen";
import { ChooseLearningLanguageScreen } from "./screens/ChooseLearningLanguageScreen";
import { ChooseLevelScreen } from "./screens/ChooseLevelScreen";
import { LevelTestScreen } from "./screens/LevelTestScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";
import { useAuth } from "./hooks/useAuth";
import {
  detectInitialUiLanguage,
  type UiLangCode,
} from "./utils/detectUiLanguage";
import { t } from "./i18n";
import "./index.css";
import { ForgotPasswordScreen } from "./screens/ForgotPasswordScreen";

type ScreenId =
  | "auth"
  | "forgot-password"
  | "choose-ui-language"
  | "choose-learning-language"
  | "choose-level"
  | "level-test"
  | "dashboard";

type AuthMode = "register" | "login";

const SESSION_TTL_MS = 10 * 60 * 1000; // 10 минут

function getInitialScreen(): ScreenId {
  if (typeof window === "undefined") return "auth";

  try {
    const token = window.localStorage.getItem("token");
    const issuedAtStr = window.localStorage.getItem("token_issued_at");

    if (!token || !issuedAtStr) return "auth";

    const issuedAt = Number(issuedAtStr);
    const now = Date.now();

    // если токен протух — чистим и кидаем на авторизацию
    if (!Number.isFinite(issuedAt) || now - issuedAt > SESSION_TTL_MS) {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("token_issued_at");
      return "auth";
    }

    // токен жив → смотрим, что уже выбрано
    const uiLang = window.localStorage.getItem("ui_language");
    const learningLang = window.localStorage.getItem("learning_language");
    const learningLevel = window.localStorage.getItem("learning_level");

    if (learningLevel) return "dashboard";
    if (learningLang) return "choose-level";
    if (uiLang) return "choose-learning-language";
    return "choose-ui-language";
  } catch {
    return "auth";
  }
}

function App() {
  // стартовый экран зависит от токена + выбранных шагов до дэшборда
  const [screen, setScreen] = useState<ScreenId>(() => getInitialScreen());
  const [authMode, setAuthMode] = useState<AuthMode>("register");

  const [uiLanguage, setUiLanguage] = useState<UiLangCode>(() =>
    detectInitialUiLanguage()
  );

  const [learningLanguage, setLearningLanguage] = useState<string | null>(
    () => {
      if (typeof window === "undefined") return null;
      try {
        return window.localStorage.getItem("learning_language");
      } catch {
        return null;
      }
    }
  );

  const [learningLevel, setLearningLevel] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem("learning_level");
    } catch {
      return null;
    }
  });

  // email для экрана "забыли пароль"
  const [tempEmail, setTempEmail] = useState<string>("");

  const { isLoading, login, register } = useAuth();

  const handleChangeUiLanguage = (code: UiLangCode) => {
    setUiLanguage(code);
    try {
      window.localStorage.setItem("ui_language", code);
    } catch {
      /* ignore */
    }
  };

  const handleChangeLearningLanguage = (code: string) => {
    setLearningLanguage(code);
    try {
      window.localStorage.setItem("learning_language", code);
    } catch {
      /* ignore */
    }
  };

  const handleChangeLearningLevel = (level: string) => {
    setLearningLevel(level);
    try {
      window.localStorage.setItem("learning_level", level);
    } catch {
      /* ignore */
    }
  };

  // успешный ЛОГИН → запускаем онбординг (если он ещё не пройден)
  const handleLoginSuccess = () => {
    // если уже всё выбрано до уровня → можно сразу в дэшборд
    const savedLevel = window.localStorage.getItem("learning_level");
    const savedLearningLang = window.localStorage.getItem("learning_language");
    const savedUiLang = window.localStorage.getItem("ui_language");

    if (savedLevel) {
      setScreen("dashboard");
      return;
    }
    if (savedLearningLang) {
      setScreen("choose-level");
      return;
    }
    if (savedUiLang) {
      setScreen("choose-learning-language");
      return;
    }

    setScreen("choose-ui-language");
  };

  // успешная РЕГИСТРАЦИЯ → на Login (email у нас уже в localStorage)
  const handleRegisterSuccess = () => {
    setAuthMode("login");
    setScreen("auth");
  };

  const handleForgotPassword = (email: string) => {
    setTempEmail(email);
    setScreen("forgot-password");
  };

  const handleContinueFromUiLanguage = () => {
    if (!uiLanguage) return;
    setScreen("choose-learning-language");
  };

  const handleContinueFromLearningLanguage = () => {
    if (!learningLanguage) return;
    setScreen("choose-level");
  };

  const handleContinueFromLevel = () => {
    if (!learningLevel) return;
    setScreen("dashboard");
  };

  const handleStartLevelTest = () => setScreen("level-test");

  const handleFinishLevelTest = (detectedLevel: string) => {
    setLearningLevel(detectedLevel);
    try {
      window.localStorage.setItem("learning_level", detectedLevel);
    } catch {
      /* ignore */
    }
    setScreen("dashboard");
  };

  const handleBack = () => {
    if (screen === "choose-ui-language") return setScreen("auth");
    if (screen === "choose-learning-language")
      return setScreen("choose-ui-language");
    if (screen === "choose-level") return setScreen("choose-learning-language");
    if (screen === "level-test") return setScreen("choose-level");
    if (screen === "dashboard") return setScreen("choose-level");
    if (screen === "forgot-password") return setScreen("auth");
  };

  const showBackButton = screen !== "auth";

  return (
    <div className="app-shell">
      <header className="app-header">
        {showBackButton && (
          <button
            type="button"
            className="app-back-button"
            onClick={handleBack}
            aria-label="Back"
          >
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
          {/* AUTH */}
          {screen === "auth" && (
            <>
              <div className="page-title">
                {t(uiLanguage, "auth.welcomeTitle")}
              </div>
              <p className="page-subtitle">
                {t(uiLanguage, "auth.welcomeSubtitle")}
              </p>

              <div className="auth-toggle">
                <button
                  type="button"
                  className={
                    "auth-toggle-button" +
                    (authMode === "register"
                      ? " auth-toggle-button-active"
                      : "")
                  }
                  onClick={() => setAuthMode("register")}
                >
                  {t(uiLanguage, "auth.signUp")}
                </button>
                <button
                  type="button"
                  className={
                    "auth-toggle-button" +
                    (authMode === "login" ? " auth-toggle-button-active" : "")
                  }
                  onClick={() => setAuthMode("login")}
                >
                  {t(uiLanguage, "auth.logIn")}
                </button>
              </div>

              {authMode === "register" ? (
                <RegisterForm
                  uiLanguage={uiLanguage}
                  onRegister={register}
                  isLoading={isLoading}
                  onSuccess={handleRegisterSuccess}
                />
              ) : (
                <LoginForm
                  uiLanguage={uiLanguage}
                  onLogin={login}
                  isLoading={isLoading}
                  onSuccess={handleLoginSuccess}
                  onForgotPassword={handleForgotPassword}
                />
              )}
            </>
          )}

          {/* FORGOT PASSWORD */}
          {screen === "forgot-password" && (
            <ForgotPasswordScreen
              initialEmail={tempEmail}
              onBack={() => setScreen("auth")}
            />
          )}

          {/* CHOOSE UI LANGUAGE */}
          {screen === "choose-ui-language" && (
            <ChooseLanguageScreen
              uiLanguage={uiLanguage}
              selectedCode={uiLanguage}
              onChangeSelected={handleChangeUiLanguage}
              onContinue={handleContinueFromUiLanguage}
            />
          )}

          {/* CHOOSE LEARNING LANGUAGE */}
          {screen === "choose-learning-language" && (
            <ChooseLearningLanguageScreen
              uiLanguage={uiLanguage}
              selectedCode={learningLanguage}
              onChangeSelected={handleChangeLearningLanguage}
              onContinue={handleContinueFromLearningLanguage}
            />
          )}

          {/* CHOOSE LEVEL */}
          {screen === "choose-level" && (
            <ChooseLevelScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              selectedLevel={learningLevel}
              onChangeLevel={handleChangeLearningLevel}
              onContinue={handleContinueFromLevel}
              onStartTest={handleStartLevelTest}
            />
          )}

          {/* QUICK LEVEL TEST */}
          {screen === "level-test" && (
            <LevelTestScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              onFinish={handleFinishLevelTest}
            />
          )}

          {/* DASHBOARD */}
          {screen === "dashboard" && (
            <DashboardScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              learningLevel={learningLevel}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <span>© 2025 LangProject. All rights reserved.</span>
        <span>{uiLanguage.toUpperCase()}</span>
      </footer>
    </div>
  );
}

export default App;
