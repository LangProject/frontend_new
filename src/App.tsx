import { useState } from "react";

import { ChooseLanguageScreen } from "./screens/ChooseLanguageScreen";
import { ChooseLearningLanguageScreen } from "./screens/ChooseLearningLanguageScreen";
import { ChooseLevelScreen } from "./screens/ChooseLevelScreen";
import { LevelTestScreen } from "./screens/LevelTestScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { ForgotPasswordScreen } from "./screens/ForgotPasswordScreen";
import { LearningPathDetailsScreen } from "./screens/LearningPathDetailsScreen";
import "./screens/learningPath.css";
import "./screens/lesson.css";

import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";

import { LessonEngine } from "./lessons/LessonEngine";

import { useAuth } from "./hooks/useAuth";
import {
  detectInitialUiLanguage,
  type UiLangCode,
} from "./utils/detectUiLanguage";
import { t } from "./i18n";

import "./index.css";
import "./App.css";

type ScreenId =
  | "auth"
  | "forgot-password"
  | "choose-ui-language"
  | "choose-learning-language"
  | "choose-level"
  | "level-test"
  | "dashboard"
  | "settings"
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

  const showBackButton =
    screen !== "auth" &&
    screen !== "dashboard" &&
    screen !== "choose-ui-language";

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
      case "settings":
        setScreen(isAuthenticated ? "dashboard" : "auth");
        break;
      case "path-details":
        setScreen("dashboard");
        break;
      case "lesson":
        setScreen("path-details");
        break;
      default:
        setScreen("auth");
    }
  };

  const handleOpenSettings = () => setScreen("settings");

  // -------- AUTH ----------
  const handleLogin = async (data: { email: string; password: string }) => {
    await login({ email: data.email, password: data.password });
  };

  const handleLoginSuccess = () => setScreen("choose-ui-language");

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
  };

  const handleRegisterSuccess = () => setScreen("choose-ui-language");

  const handleForgotPassword = (email: string) => {
    setForgotEmail(email);
    setScreen("forgot-password");
  };

  // -------- ONBOARDING ----------
  const handleUiLanguageSelected = (lang: UiLangCode) => {
    setUiLanguage(lang);
    try {
      window.localStorage.setItem("ui_language", lang);
    } catch {}
  };

  const handleUiLanguageContinue = () => {
    setScreen("choose-learning-language");
  };

  const handleLearningLanguageContinue = () => {
    if (!learningLanguage) return;
    setScreen("choose-level");
  };

  const handleLevelChosen = (levelCode: string) => {
    setLearningLevel(levelCode.toUpperCase());
  };

  const handleLevelContinue = () => {
    if (!learningLevel) return;
    setScreen("dashboard");
  };

  const handleStartLevelTest = () => {
    setScreen("level-test");
  };

  const handleFinishLevelTest = (detectedLevel: string) => {
    setLearningLevel(detectedLevel.toUpperCase());
    setScreen("dashboard");
  };

  // -------- DASHBOARD -> PATH ----------
  const handleOpenPathFromDashboard = (pathId: string) => {
    setCurrentPathId(pathId);
    setScreen("path-details");
  };

  return (
    <div className="app-root">
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

        <button
          type="button"
          className="settings-button"
          aria-label="Open settings"
          onClick={handleOpenSettings}
        >
          ⚙︎
        </button>
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

              <div className="auth-tabs">
                <div className="auth-tabs-switch">
                  <button
                    type="button"
                    className={
                      "auth-tabs-btn" +
                      (authMode === "login" ? " auth-tabs-btn-active" : "")
                    }
                    onClick={() => setAuthMode("login")}
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    className={
                      "auth-tabs-btn" +
                      (authMode === "register" ? " auth-tabs-btn-active" : "")
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
                    onSuccess={handleLoginSuccess}
                    onForgotPassword={handleForgotPassword}
                  />
                ) : (
                  <RegisterForm
                    uiLanguage={uiLanguage}
                    isLoading={isLoading}
                    onRegister={handleRegister}
                    onSuccess={handleRegisterSuccess}
                  />
                )}
              </div>
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
              onChangeSelected={(code) => setUiLanguage(code as UiLangCode)}
              onContinue={handleUiLanguageContinue}
            />
          )}

          {screen === "choose-learning-language" && (
            <ChooseLearningLanguageScreen
              uiLanguage={uiLanguage}
              selectedCode={learningLanguage}
              onChangeSelected={setLearningLanguage}
              onContinue={handleLearningLanguageContinue}
            />
          )}

          {screen === "choose-level" && (
            <ChooseLevelScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              selectedLevel={learningLevel}
              onChangeSelected={handleLevelChosen}
              onContinue={handleLevelContinue}
              onStartTest={handleStartLevelTest}
            />
          )}

          {screen === "level-test" && (
            <LevelTestScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              onFinish={handleFinishLevelTest}
            />
          )}

          {screen === "dashboard" && (
            <DashboardScreen
              uiLanguage={uiLanguage}
              learningLanguageCode={learningLanguage}
              learningLevel={learningLevel}
              onOpenPath={handleOpenPathFromDashboard}
            />
          )}

          {screen === "path-details" && currentPathId && (
            <LearningPathDetailsScreen
              pathId={currentPathId}
              onBack={() => setScreen("dashboard")}
              onStartLesson={(lessonId) => {
                setCurrentLessonId(lessonId);
                setScreen("lesson");
              }}
            />
          )}

          {screen === "lesson" && currentLessonId && (
            <LessonEngine
              lessonId={currentLessonId}
              onFinish={() => setScreen("path-details")}
            />
          )}

          {screen === "settings" && (
            <div className="settings-placeholder">
              <h2 className="page-title">Settings</h2>
              <p className="page-subtitle">
                Here will be app settings later (theme, language, profile,
                etc.).
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <span>© 2025 LangProject. All rights reserved.</span>
        <span>{uiLanguage.toUpperCase()}</span>
        {isAuthenticated && (
          <button type="button" className="logout-link" onClick={logout}>
            Log out
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;
