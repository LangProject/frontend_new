import { useState, useEffect } from "react";

/* Screens (Экраны приложения) */
import { ChooseLanguageScreen } from "./screens/ChooseLanguageScreen";
import { ChooseLearningLanguageScreen } from "./screens/ChooseLearningLanguageScreen";
import { ChooseLevelScreen } from "./screens/ChooseLevelScreen";
import { LevelTestScreen } from "./screens/LevelTestScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { ForgotPasswordScreen } from "./screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "./screens/ResetPasswordScreen"; // Добавлено
import { LessonScreen } from "./screens/LessonScreen";

/* Hooks & utils (Хуки и утилиты) */
import { useAuth } from "./hooks/useAuth";
import { useSession } from "./hooks/useSession";
import {
  detectInitialUiLanguage,
  type UiLangCode,
} from "./utils/detectUiLanguage";
import { t } from "./i18n";

/* Styles (Стили) */
import "./screens/learningPath.css";
import "./screens/lesson.css";
import "./index.css";
import "./App.css";

/* Components (Компоненты) */
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";

/** Список возможных идентификаторов экранов приложения */
type ScreenId =
  | "auth"
  | "forgot-password"
  | "reset-password" // Добавлено
  | "choose-ui-language"
  | "choose-learning-language"
  | "choose-level"
  | "level-test"
  | "dashboard"
  | "lesson";

/** Режим авторизации: вход или регистрация */
type AuthMode = "login" | "register";

/** Мапа для преобразования кодов языков во внутренние названия */
const LANG_MAP: Record<string, string> = {
  ru: "russian",
  de: "german",
  en: "english",
  es: "spanish",
  fr: "french",
  pl: "polish",
};

/** Мапа для обратного преобразования языков с бэкенда на фронтенд */
const BACKEND_TO_FRONTEND_LANG: Record<string, string> = {
  Russian: "ru",
  German: "de",
  English: "en",
  Spanish: "es",
  French: "fr",
  Polish: "pl",
};

const API_URL = ""; // Пусто, так как используется Vite Proxy

function App() {
  /** Логика авторизации из кастомного хука */
  const { isAuthenticated, isLoading, login, register, logout } = useAuth();
  /** Управление сессией пользователя */
  useSession(isAuthenticated);

  /** Состояние выбранного языка интерфейса */
  const [uiLanguage, setUiLanguage] = useState<UiLangCode>(
    () =>
      (localStorage.getItem("ui_language") as UiLangCode) ||
      detectInitialUiLanguage()
  );

  /** Изучаемый язык */
  const [learningLanguage, setLearningLanguage] = useState<string | null>(() =>
    localStorage.getItem("learning_language")
  );

  /** Уровень владения языком */
  const [learningLevel, setLearningLevel] = useState<string | null>(() =>
    localStorage.getItem("learning_level")
  );

  /** Текущий активный экран */
  const [screen, setScreen] = useState<ScreenId>("auth");
  /** Текущий режим входа (login/register) */
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  /** ID текущего активного урока */
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  /** Состояние глобальной инициализации (загрузки данных) */
  const [isInitializing, setIsInitializing] = useState(false);

  // --- ЭФФЕКТ ОТСЛЕЖИВАНИЯ ССЫЛКИ СБРОСА ПАРОЛЯ ---
  useEffect(() => {
    /** Если в URL есть токен, принудительно открываем экран сброса */
    const params = new URLSearchParams(window.location.search);
    if (params.has("token")) {
      setScreen("reset-password");
    }
  }, []);

/// --- ЛОГИКА СИНХРОНИЗАЦИИ (ИСПРАВЛЕННАЯ) ---
  useEffect(() => {
    const syncUserData = async () => {
      // Базовые проверки: если не вошли или уже в уроке — не мешаем
      if (!isAuthenticated || screen === "lesson") return;

      console.log("Syncing with backend...");
      setIsInitializing(true);

      try {
        // ИСПРАВЛЕНИЕ 1: Берем правильное имя токена (auth_token, как на вашем скрине)
        const token = localStorage.getItem("auth_token"); 
        if (!token) throw new Error("No auth token found");

        // ИСПРАВЛЕНИЕ 2: Игнорируем localStorage.is_initialized и всегда спрашиваем сервер
        const statsRes = await fetch(`${API_URL}/user/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-session-id": localStorage.getItem("session_id") || "dashboard-init",
          },
        });

        // СЦЕНАРИЙ А: ПОЛЬЗОВАТЕЛЬ СУЩЕСТВУЕТ (Бэк вернул 200 OK)
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          const langData = statsData.language_data;

          // Проверяем, что данные реальны
          if (langData && langData.target_language) {
            console.log("User exists. Syncing...");

            // Восстанавливаем язык
            const backendLang = langData.target_language;
            const frontendLang = BACKEND_TO_FRONTEND_LANG[backendLang] || backendLang;
            
            // Восстанавливаем уровень
            let userLevel = "A1";
            if (langData.ratings) {
              const firstKey = Object.keys(langData.ratings)[0];
              if (firstKey && langData.ratings[firstKey].cefr) {
                userLevel = langData.ratings[firstKey].cefr;
              }
            }

            // Сохраняем в стейт
            setLearningLanguage(frontendLang);
            setLearningLevel(userLevel);
            
            // Чиним локальные данные, чтобы всё было красиво
            localStorage.setItem("learning_language", frontendLang);
            localStorage.setItem("learning_level", userLevel);
            localStorage.setItem("is_initialized", "true"); // Исправляем ошибочный false
            localStorage.setItem("setup_complete", "true");

            // Если мы на экране входа/настройки — сразу кидаем в Дашборд
            if (["auth", "choose-ui-language", "choose-learning-language", "choose-level"].includes(screen)) {
              setScreen("dashboard");
            }
            return;
          }
        }

        // СЦЕНАРИЙ Б: ПОЛЬЗОВАТЕЛЬ НОВЫЙ (Бэк вернул ошибку или нет данных)
        throw new Error("User needs setup");

      } catch (e) {
        console.log("Redirecting to setup flow:", e);
        
        // Очищаем хвосты
        localStorage.setItem("is_initialized", "false");
        localStorage.removeItem("learning_language");
        setLearningLanguage(null);
        setLearningLevel(null);

        // Отправляем заполнять данные (начинаем с выбора языка)
        if (screen === "auth") {
           setScreen("choose-ui-language");
        }
      } finally {
        setIsInitializing(false);
      }
    };

    syncUserData();
  }, [isAuthenticated]);

  // --- ОБРАБОТЧИКИ (HANDLERS) ---

  /** Запуск урока через API */
  const handleStartLesson = async (sectionType: string) => {
    try {
      setIsInitializing(true);
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No auth token");

      const res = await fetch(`${API_URL}/session/begin-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to create session");
      const data = await res.json();
      const realSessionId = data.id;

      const levelRes = await fetch(`${API_URL}/session/begin-level`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-session-id": realSessionId,
        },
        body: JSON.stringify({
          session_id: realSessionId,
          section_name: sectionType,
        }),
      });

      if (!levelRes.ok) throw new Error("Invalid section type: " + sectionType);

      localStorage.setItem("session_id", realSessionId);
      setCurrentLessonId(realSessionId);
      setScreen("lesson");
    } catch (e: any) {
      alert(`Не удалось начать урок: ${e.message}`);
    } finally {
      setIsInitializing(false);
    }
  };

  /** Обработка регистрации */
  const handleRegisterFormSubmit = async (data: any) => {
    try {
      await register(data);
      setAuthMode("login");
    } catch (e: any) {
      alert(e.message || "Registration failed");
    }
  };

  /** Финализация настроек нового пользователя */
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

      if (!res.ok) throw new Error("Server initialization error");

      localStorage.setItem("setup_complete", "true");
      setScreen("dashboard");
    } catch (e: any) {
      alert("Ошибка сохранения настроек: " + e.message);
    } finally {
      setIsInitializing(false);
    }
  };

  /** Логика кнопки "Назад" в зависимости от текущего экрана */
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

          {/* ЭКРАН ЗАБЫЛИ ПАРОЛЬ */}
          {screen === "forgot-password" && (
            <ForgotPasswordScreen initialEmail={""} onBack={() => setScreen("auth")} />
          )}

          {/* ЭКРАН УСТАНОВКИ НОВОГО ПАРОЛЯ */}
          {screen === "reset-password" && (
            <ResetPasswordScreen 
              onSuccess={() => setScreen("auth")} 
              onBack={() => setScreen("auth")} 
            />
          )}

          {/* ЭКРАНЫ НАСТРОЙКИ (ВЫБОР ЯЗЫКОВ И ТЕСТ) */}
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

          {/* ДАШБОРД */}
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

          {/* ЭКРАН УРОКА */}
          {screen === "lesson" && currentLessonId && (
            <LessonScreen lessonId={currentLessonId} onBack={() => setScreen("dashboard")} />
          )}
        </div>
      </main>

      {/* FOOTER (ПОДВАЛ) */}
      {screen !== "lesson" && (
        <footer className="app-footer">
          <span className="footer-text">© 2025 LangProject. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <a className="footer-link" href="#" onClick={(e) => e.preventDefault()}>LinkedIn</a>
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