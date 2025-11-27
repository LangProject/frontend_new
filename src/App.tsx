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

type ScreenId =
  | "auth"
  | "choose-ui-language"
  | "choose-learning-language"
  | "choose-level"
  | "level-test"
  | "dashboard";

type AuthMode = "register" | "login";

function App() {
  const [screen, setScreen] = useState<ScreenId>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("register");

  // ВАЖНО: первый запуск — всегда "en", дальше из localStorage
  const [uiLanguage, setUiLanguage] = useState<UiLangCode>(() =>
    detectInitialUiLanguage()
  );

  const [learningLanguage, setLearningLanguage] = useState<string | null>(null);
  const [learningLevel, setLearningLevel] = useState<string | null>(null);

  const { isLoading, login, register } = useAuth();

  const handleChangeUiLanguage = (code: UiLangCode) => {
    setUiLanguage(code);
    try {
      window.localStorage.setItem("ui_language", code);
    } catch {
      /* ignore */
    }
  };

  const handleAuthSuccess = () => {
    setScreen("choose-ui-language");
  };

  const handleForgotPassword = (email: string) => {
    if (!email || !email.includes("@")) {
      alert("Please enter your email first.");
      return;
    }

    alert(
      `If an account exists for ${email}, we’ll send password reset instructions.`
    );
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
    setScreen("dashboard");
  };

  const handleBack = () => {
    if (screen === "choose-ui-language") return setScreen("auth");
    if (screen === "choose-learning-language")
      return setScreen("choose-ui-language");
    if (screen === "choose-level") return setScreen("choose-learning-language");
    if (screen === "level-test") return setScreen("choose-level");
    if (screen === "dashboard") return setScreen("choose-level");
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
            </>
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
              onChangeSelected={setLearningLanguage}
              onContinue={handleContinueFromLearningLanguage}
            />
          )}

          {/* LEVEL SELECT / TEST TOGGLE */}
          {screen === "choose-level" && (
            <ChooseLevelScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              selectedLevel={learningLevel}
              onChangeLevel={setLearningLevel}
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
