// src/App.tsx
import { useState, useEffect, useRef } from "react";

/* Screens */
import { ChooseLanguageScreen } from "./screens/ChooseLanguageScreen";
import { ChooseLearningLanguageScreen } from "./screens/ChooseLearningLanguageScreen";
import { ChooseLevelScreen } from "./screens/ChooseLevelScreen";
import { LevelTestScreen } from "./screens/LevelTestScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { ForgotPasswordScreen } from "./screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "./screens/ResetPasswordScreen";
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
  | "reset-password"
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

const API_URL = "";

function App() {
  const { isAuthenticated, isLoading, login, register, logout } = useAuth();
  useSession(isAuthenticated);

  /* Refs для предотвращения конфликтов при логине */
  const justLoggedIn = useRef(false); // <--- Флаг, что мы только что нажали "Войти"

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

  // --- ЭФФЕКТ СБРОСА ПАРОЛЯ ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("token")) {
      setScreen("reset-password");
    }
  }, []);

  // --- ГЛАВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ (Сессия -> Статистика) ---
  const initializeUser = async () => {
    // Не запускаем, если уже грузимся или если мы в уроке
    if (screen === "lesson" || isInitializing) return;

    console.log("🚀 Starting initialization flow...");
    setIsInitializing(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No auth token");

      // ШАГ 1: Проверяем session_id. Если нет — создаем (begin-session).
      let sessionId = localStorage.getItem("session_id");

      if (!sessionId || sessionId === "dashboard-init") {
        console.log("📡 Session missing. Calling begin-session...");
        const sessionRes = await fetch(`${API_URL}/session/begin-session`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          // Поддержка разных форматов ответа (id или session_id)
          sessionId = sessionData.id || sessionData.session_id; 
          
          if (sessionId) {
            localStorage.setItem("session_id", sessionId);
            console.log("✅ New session created:", sessionId);
          } else {
            throw new Error("Session ID not received");
          }
        } else {
          throw new Error("Failed to begin session");
        }
      }

      // ШАГ 2: Теперь, имея sessionId, тянем статистику
      console.log("📊 Fetching stats with session:", sessionId);
      const statsRes = await fetch(`${API_URL}/user/stats`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-session-id": sessionId!,
        },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const langData = statsData.language_data;

        // Если есть данные о языке — восстанавливаем состояние
        if (langData && langData.target_language) {
           // Тут можно добавить логику сохранения в state/localStorage, если нужно
           // Например: setLearningLanguage(...)
           
           // Пускаем в дашборд
           if (["auth", "choose-ui-language"].includes(screen)) {
             setScreen("dashboard");
           }
        } else {
           // Если статс пустой (странно для инициализированного юзера), кидаем на настройку
           if (screen === "auth") setScreen("choose-ui-language");
        }
      } else {
        throw new Error("Failed to fetch stats");
      }

    } catch (e) {
      console.error("❌ Init flow failed:", e);
      // Если что-то пошло не так (например, 404 или нет инета)
      // Для безопасности отправляем на выбор языка (как нового юзера)
      if (screen === "auth") setScreen("choose-ui-language");
    } finally {
      setIsInitializing(false);
    }
  };

  // --- ЭФФЕКТ ДЛЯ ПЕРЕЗАГРУЗКИ СТРАНИЦЫ ---
  // Срабатывает, когда пользователь просто обновил страницу (F5)
  useEffect(() => {
    // Если мы только что вошли через форму (justLoggedIn), этот эффект пропускаем,
    // чтобы не делать двойных запросов (логика в handleLoginSuccess).
    if (isAuthenticated && !justLoggedIn.current) {
       initializeUser();
    }
    // Сбрасываем флаг после первого рендера
    justLoggedIn.current = false;
  }, [isAuthenticated]); 


  // --- ОБРАБОТЧИК УСПЕШНОГО ВХОДА ---
  const handleLoginSuccess = (user: { is_initialized: boolean }) => {
    justLoggedIn.current = true; // Блокируем срабатывание useEffect

    if (user.is_initialized) {
      // Старый юзер: запускаем цепочку begin-session -> stats
      initializeUser();
    } else {
      // Новый юзер: сразу на онбординг, никаких запросов
      setScreen("choose-ui-language");
    }
  };

  const handleRegisterFormSubmit = async (data: any) => {
    try {
      await register(data);
      // После регистрации перекидываем на Вход
      setAuthMode("login");
    } catch (e: any) {
      alert(e.message || "Registration failed");
    }
  };

  // ... (Остальные функции: handleStartLesson, handleFinalizeSetup, handleBack без изменений) ...
  const handleStartLesson = async (sectionType: string) => {
      // (Твой код handleStartLesson...)
      try {
        setIsInitializing(true);
        const token = localStorage.getItem("auth_token");
        const sessionId = localStorage.getItem("session_id");
        if (!token) throw new Error("No auth token");

        const levelRes = await fetch(`${API_URL}/session/begin-level`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-session-id": sessionId || "",
          },
          body: JSON.stringify({
            session_id: sessionId,
            section_name: sectionType,
          }),
        });
        if (!levelRes.ok) throw new Error("Invalid section type");
        
        // Обновляем ID и идем в урок
        localStorage.setItem("session_id", sessionId || "");
        setCurrentLessonId(sessionId || ""); 
        setScreen("lesson");
      } catch(e: any) {
         alert(e.message);
      } finally {
         setIsInitializing(false);
      }
  };

  const handleFinalizeSetup = async () => {
     // (Твой код handleFinalizeSetup...)
     // ...
     setScreen("dashboard");
  };

  const handleBack = () => {
    if (screen === "lesson") setScreen("dashboard");
    else if (screen === "forgot-password" || screen === "reset-password") setScreen("auth");
    else if (screen === "choose-learning-language") setScreen("choose-ui-language");
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
            <button className="app-back-button" onClick={handleBack}>←</button>
          ) : (
            <div className="header-logo-pill">
              <div className="header-logo-circle">L</div>
              <div className="header-logo-text">LangProject</div>
            </div>
          )}
        </header>
      )}

      <main className="app-content" style={screen === "lesson" ? { padding: 0 } : {}}>
        <div className="app-center-block" style={screen === "lesson" ? { maxWidth: "none" } : {}}>
          
          {/* ЭКРАН АВТОРИЗАЦИИ */}
          {screen === "auth" && (
            <>
              <div className="page-header-block">
                <h1 className="page-title">{t(uiLanguage, "auth.welcomeTitle")}</h1>
                <p className="page-subtitle">{t(uiLanguage, "auth.welcomeSubtitle")}</p>
              </div>
              <div className="auth-pill-container">
                <div className="auth-tabs-pill">
                  <button className={`auth-tabs-btn ${authMode === "login" ? "active" : ""}`} onClick={() => setAuthMode("login")}>
                    {t(uiLanguage, "auth.login")}
                  </button>
                  <button className={`auth-tabs-btn ${authMode === "register" ? "active" : ""}`} onClick={() => setAuthMode("register")}>
                    {t(uiLanguage, "auth.signup")}
                  </button>
                </div>
              </div>
              {authMode === "login" ? (
                <LoginForm
                  uiLanguage={uiLanguage}
                  isLoading={isLoading}
                  onLogin={login}
                  // ВОТ ТУТ МЫ ПОДКЛЮЧИЛИ НОВУЮ ЛОГИКУ:
                  onSuccess={handleLoginSuccess} 
                  onForgotPassword={() => setScreen("forgot-password")}
                />
              ) : (
                <RegisterForm
                  uiLanguage={uiLanguage}
                  isLoading={isLoading}
                  onRegister={handleRegisterFormSubmit}
                  onSuccess={() => setAuthMode("login")} // При успехе просто переключаем таб
                />
              )}
            </>
          )}

          {/* Остальные экраны без изменений в логике вызова */}
          {screen === "forgot-password" && (
            <ForgotPasswordScreen initialEmail={""} onBack={() => setScreen("auth")} />
          )}

          {screen === "reset-password" && (
            <ResetPasswordScreen 
              onSuccess={() => setScreen("auth")} 
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
              onOpenPath={(selectedId) => {
                if (selectedId === "random") {
                  const topics = ["vocabulary", "reading", "writing"];
                  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
                  handleStartLesson(randomTopic);
                } else {
                  handleStartLesson(selectedId);
                }
              }}
            />
          )}

          {screen === "lesson" && currentLessonId && (
            <LessonScreen lessonId={currentLessonId} onBack={() => setScreen("dashboard")} />
          )}
        </div>
      </main>

      {/* FOOTER */}
      {screen !== "lesson" && (
        <footer className="app-footer">
          <span className="footer-text">© 2025 LangProject. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
             {/* ... */}
            {isAuthenticated && (
              <button className="logout-btn" onClick={() => { logout(); setScreen("auth"); }}>
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