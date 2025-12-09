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
import { LessonEngine } from "./lessons/LessonEngine";

type ScreenId =
  | "auth"
  | "forgot-password"
  | "choose-ui-language"
  | "choose-learning-language"
  | "choose-level"
  | "level-test"
  | "dashboard"
  | "lesson";

type AuthMode = "register" | "login";

function App() {
  const [screen, setScreen] = useState<ScreenId>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("register");

  const [uiLanguage, setUiLanguage] = useState<UiLangCode>(
    detectInitialUiLanguage()
  );
  const [learningLanguage, setLearningLanguage] = useState<string | null>(null);
  const [learningLevel, setLearningLevel] = useState<string | null>(null);
  const [tempEmail, setTempEmail] = useState<string>("");

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

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

  const handleStartLessonFromDashboard = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setScreen("lesson");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
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
              onChangeSelected={setLearningLanguage}
              onContinue={handleContinueFromLearningLanguage}
            />
          )}

          {/* CHOOSE LEVEL */}
          {screen === "choose-level" && (
            <ChooseLevelScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              selectedLevel={learningLevel}
              onChangeLevel={setLearningLevel}
              onContinue={handleContinueFromLevel}
              onStartTest={() => setScreen("level-test")}
            />
          )}

          {/* LEVEL TEST */}
          {screen === "level-test" && (
            <LevelTestScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              onFinish={() => setScreen("dashboard")}
            />
          )}

          {/* DASHBOARD */}
          {screen === "dashboard" && (
            <DashboardScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              learningLevel={learningLevel}
              onStartLesson={handleStartLessonFromDashboard}
            />
          )}

          {/* LESSON ENGINE */}
          {screen === "lesson" && currentLessonId && (
            <LessonEngine
              lessonId={currentLessonId}
              onBack={() => setScreen("dashboard")}
              onFinish={() => setScreen("dashboard")}
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
