import { useState } from "react";
import { ChooseLanguageScreen } from "./screens/ChooseLanguageScreen";
import { ChooseLearningLanguageScreen } from "./screens/ChooseLearningLanguageScreen";
import { ChooseLevelScreen } from "./screens/ChooseLevelScreen";
import { LevelTestScreen } from "./screens/LevelTestScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";
import { useAuth } from "./hooks/useAuth";
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

  const [uiLanguage, setUiLanguage] = useState<string | null>(null);
  const [learningLanguage, setLearningLanguage] = useState<string | null>(null);
  const [learningLevel, setLearningLevel] = useState<string | null>(null);

  const { isLoading, login, register } = useAuth();

  // —— AUTH FLOW ——
  const handleAuthSuccess = () => {
    setScreen("choose-ui-language");
  };

  const handleForgotPassword = (email: string) => {
    if (!email || !email.includes("@")) {
      alert("Please enter your email first.");
      return;
    }

    // TODO: заменить на реальный запрос на бэкенд
    console.log("Forgot password for:", email);
    alert(
      `If an account exists for ${email}, we’ll send password reset instructions.`
    );
  };

  // —— NAV FROM UI LANGUAGE ——
  const handleContinueFromUiLanguage = () => {
    if (!uiLanguage) return;
    setScreen("choose-learning-language");
  };

  // —— NAV FROM LEARNING LANGUAGE ——
  const handleContinueFromLearningLanguage = () => {
    if (!learningLanguage) return;
    setScreen("choose-level");
  };

  // —— NAV FROM LEVEL (SELECTED) ——
  const handleContinueFromLevel = () => {
    if (!learningLevel) return;
    setScreen("dashboard");
  };

  // —— LEVEL TEST FLOW ——
  const handleStartLevelTest = () => {
    setScreen("level-test");
  };

  const handleFinishLevelTest = (detectedLevel: string) => {
    setLearningLevel(detectedLevel);
    setScreen("dashboard");
  };

  // —— BACK BUTTON ——
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
              <div className="page-title">Welcome</div>
              <p className="page-subtitle">
                Create an account or log in to save your progress.
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
                  Sign up
                </button>
                <button
                  type="button"
                  className={
                    "auth-toggle-button" +
                    (authMode === "login" ? " auth-toggle-button-active" : "")
                  }
                  onClick={() => setAuthMode("login")}
                >
                  Log in
                </button>
              </div>

              {authMode === "register" ? (
                <RegisterForm
                  onRegister={register}
                  isLoading={isLoading}
                  onSuccess={handleAuthSuccess}
                />
              ) : (
                <LoginForm
                  onLogin={login}
                  isLoading={isLoading}
                  onSuccess={handleAuthSuccess}
                  onForgotPassword={handleForgotPassword}
                />
              )}
            </>
          )}

          {/* UI LANGUAGE */}
          {screen === "choose-ui-language" && (
            <ChooseLanguageScreen
              selectedCode={uiLanguage}
              onChangeSelected={setUiLanguage}
              onContinue={handleContinueFromUiLanguage}
            />
          )}

          {/* LEARNING LANGUAGE */}
          {screen === "choose-learning-language" && (
            <ChooseLearningLanguageScreen
              selectedCode={learningLanguage}
              onChangeSelected={setLearningLanguage}
              onContinue={handleContinueFromLearningLanguage}
            />
          )}

          {/* LEVEL SELECT / TEST SWITCH */}
          {screen === "choose-level" && (
            <ChooseLevelScreen
              learningLanguageCode={learningLanguage}
              selectedLevel={learningLevel}
              onChangeLevel={setLearningLevel}
              onContinue={handleContinueFromLevel}
              onStartTest={handleStartLevelTest}
            />
          )}

          {/* LEVEL TEST */}
          {screen === "level-test" && (
            <LevelTestScreen
              learningLanguageCode={learningLanguage}
              onFinish={handleFinishLevelTest}
            />
          )}

          {/* DASHBOARD */}
          {screen === "dashboard" && (
            <DashboardScreen
              learningLanguageCode={learningLanguage}
              learningLevel={learningLevel}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <span>© 2025 LangProject. All rights reserved.</span>
        <span>LinkedIn</span>
      </footer>
    </div>
  );
}

export default App;
