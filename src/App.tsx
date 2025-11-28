import { useState } from "react";
import { ChooseLanguageScreen } from "./screens/ChooseLanguageScreen";
import { ChooseLearningLanguageScreen } from "./screens/ChooseLearningLanguageScreen";
import { ChooseLevelScreen } from "./screens/ChooseLevelScreen";
import { LevelTestScreen } from "./screens/LevelTestScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { ForgotPasswordScreen } from "./screens/ForgotPasswordScreen";

import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";

import { useAuth } from "./hooks/useAuth";
import {
  detectInitialUiLanguage,
  type UiLangCode,
} from "./utils/detectUiLanguage";
import { t } from "./i18n";

import "./index.css";

type ScreenId =
  | "auth"
  | "choose-ui-language"
  | "choose-learning-language"
  | "choose-level"
  | "level-test"
  | "dashboard"
  | "forgot-password";

type AuthMode = "register" | "login";

function App() {
  const [screen, setScreen] = useState<ScreenId>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("register");

  // первый запуск — всегда "en", дальше из localStorage
  const [uiLanguage, setUiLanguage] = useState<UiLangCode>(() =>
    detectInitialUiLanguage()
  );

  const [learningLanguage, setLearningLanguage] = useState<string | null>(null);
  const [learningLevel, setLearningLevel] = useState<string | null>(null);

  const { isLoading, login, register } = useAuth();

  // смена языка интерфейса
  const handleChangeUiLanguage = (code: UiLangCode) => {
    setUiLanguage(code);
    try {
      window.localStorage.setItem("ui_language", code);
    } catch {
      /* ignore */
    }
  };

  // после успешной регистрации/логина
  const handleAuthSuccess = () => {
    setScreen("choose-ui-language");
  };

  // переход на экран восстановления пароля
  const handleForgotPassword = (_email: string) => {
    setScreen("forgot-password");
    setAuthMode("login");
  };

  // логика отправки reset email из ForgotPasswordScreen
  const handleSendResetEmail = (email: string) => {
    // сюда потом вставишь реальный запрос на бэкенд
    console.log("Send password reset for:", email);
  };

  // переходы по мастеру выбора языков/уровней
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
    setScreen("dashboard");
  };

  const handleBack = () => {
    if (screen === "choose-ui-language") {
      setScreen("auth");
      return;
    }
    if (screen === "choose-learning-language") {
      setScreen("choose-ui-language");
      return;
    }
    if (screen === "choose-level") {
      setScreen("choose-learning-language");
      return;
    }
    if (screen === "level-test") {
      setScreen("choose-level");
      return;
    }
    if (screen === "dashboard") {
      setScreen("choose-level");
      return;
    }
    if (screen === "forgot-password") {
      setScreen("auth");
      setAuthMode("login");
      return;
    }
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
            <div className="auth-card screen screen-enter">
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
                  onSuccess={handleAuthSuccess}
                />
              ) : (
                <LoginForm
                  uiLanguage={uiLanguage}
                  onLogin={login}
                  isLoading={isLoading}
                  onSuccess={handleAuthSuccess}
                  onForgotPassword={handleForgotPassword}
                />
              )}
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {screen === "forgot-password" && (
            <div className="auth-card screen screen-enter">
              <ForgotPasswordScreen
                uiLanguage={uiLanguage}
                onSendReset={handleSendResetEmail}
                onBackToLogin={() => {
                  setScreen("auth");
                  setAuthMode("login");
                }}
              />
            </div>
          )}

          {/* CHOOSE UI LANGUAGE */}
          {screen === "choose-ui-language" && (
            <div className="screen screen-enter">
              <ChooseLanguageScreen
                uiLanguage={uiLanguage}
                selectedCode={uiLanguage}
                onChangeSelected={handleChangeUiLanguage}
                onContinue={handleContinueFromUiLanguage}
              />
            </div>
          )}

          {/* CHOOSE LEARNING LANGUAGE */}
          {screen === "choose-learning-language" && (
            <div className="screen screen-enter">
              <ChooseLearningLanguageScreen
                uiLanguage={uiLanguage}
                selectedCode={learningLanguage}
                onChangeSelected={setLearningLanguage}
                onContinue={handleContinueFromLearningLanguage}
              />
            </div>
          )}

          {/* LEVEL SELECT / TEST TOGGLE */}
          {screen === "choose-level" && (
            <div className="screen screen-enter">
              <ChooseLevelScreen
                uiLanguage={uiLanguage}
                learningLanguageCode={learningLanguage}
                selectedLevel={learningLevel}
                onChangeLevel={setLearningLevel}
                onContinue={handleContinueFromLevel}
                onStartTest={handleStartLevelTest}
              />
            </div>
          )}

          {/* QUICK LEVEL TEST */}
          {screen === "level-test" && (
            <div className="screen screen-enter">
              <LevelTestScreen
                uiLanguage={uiLanguage}
                learningLanguageCode={learningLanguage}
                onFinish={handleFinishLevelTest}
              />
            </div>
          )}

          {/* DASHBOARD */}
          {screen === "dashboard" && (
            <div className="screen screen-enter">
              <DashboardScreen
                uiLanguage={uiLanguage}
                learningLanguageCode={learningLanguage}
                learningLevel={learningLevel}
              />
            </div>
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
