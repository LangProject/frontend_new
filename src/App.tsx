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

  // --- ЛОГИКА СИНХРОНИЗАЦИИ  ---
  useEffect(() => {
    const syncUserData = async () => {
      if (!isAuthenticated) return;
      if (screen === "lesson") return;

      // 1. ОПТИМІСТИЧНИЙ ВХІД
      // Якщо у нас вже є дані в пам'яті — одразу показуємо Дашборд, не чекаючи сервера.
      const localSetup = localStorage.getItem("setup_complete");
      const hasLocalData = localSetup === "true";

      if (hasLocalData && screen === "auth") {
        setScreen("dashboard");
      }

      try {
        setIsInitializing(true);
        const token = localStorage.getItem("auth_token");
        if (!token) throw new Error("No token");

        const statsRes = await fetch(`${API_URL}/user/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-session-id":
              localStorage.getItem("session_id") || "dashboard-init",
          },
        });

        // 2. СЕРВЕР КАЖЕ "НЕМАЄ ДАНИХ" (404)
        // Це єдиний випадок, коли ми примусово кидаємо на налаштування
        if (statsRes.status === 404) {
          throw new Error("User setup missing on server");
        }

        // 3. ІНШІ ПОМИЛКИ СЕРВЕРА (500, Мережа і т.д.)
        if (!statsRes.ok) {
          // Якщо у нас є локальні дані — ігноруємо помилку сервера і залишаємось у Дашборді
          if (hasLocalData) {
            console.warn("Server unavailable, using local data");
            return;
          }
          // А ЯКЩО ДАНИХ НЕМАЄ (новий юзер + помилка сервера) — мусимо йти на налаштування
          throw new Error("No local data and server failed");
        }

        // 4. УСПІХ (200) -> Оновлюємо дані
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

          // Переходимо в Дашборд (якщо ще не там)
          if (screen === "auth" || screen === "choose-ui-language") {
            setScreen("dashboard");
          }
        } else {
          throw new Error("No language data found");
        }
      } catch (e: any) {
        console.warn("Sync failed:", e);

        // Логіка Fallback:
        // Якщо це була просто помилка мережі і у нас є дані — нічого не робимо (залишаємось в Дашборді)
        if (hasLocalData && !e.message.includes("User setup missing")) {
          return;
        }

        // В усіх інших випадках (404 або "чистий" юзер) — на вибір мови
        localStorage.removeItem("setup_complete");
        if (screen === "auth" || screen === "dashboard") {
          setScreen("choose-ui-language");
        }
      } finally {
        setIsInitializing(false);
      }
    };

    syncUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // --- ЗАПУСК УРОКА ЧЕРЕЗ СЕРВЕР ---
  const handleStartLesson = async (sectionType: string) => {
    try {
      setIsInitializing(true);
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No auth token");

      console.log(`Starting lesson for section: ${sectionType}`);

      // 1. Создаем сессию
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

      // 2. Создаем уровень с выбранным типом!
      // Бэкенд ждет: 'reading', 'vocabulary' или 'writing'
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

      if (!levelRes.ok) {
        // Если ошибка 422, значит передали что-то не то
        const errText = await levelRes.text();
        console.error("Level creation failed:", errText);
        throw new Error("Invalid section type: " + sectionType);
      }

      // 3. Переходим к уроку
      localStorage.setItem("session_id", realSessionId);
      setCurrentLessonId(realSessionId);
      setScreen("lesson");
    } catch (e: any) {
      console.error("Lesson start error:", e);
      alert(`Не удалось начать урок (${sectionType}). Проверьте консоль.`);
    } finally {
      setIsInitializing(false);
    }
  };
  // ----------------------------------------------------

  const handleRegisterFormSubmit = async (data: any) => {
    try {
      await register(data);
      setAuthMode("login");
      console.log("Account created successfully! Please log in.");
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
      alert("Ошибка сохранения настроек: " + e.message);
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
              onOpenPath={(selectedId) => {
                // Если нажали "Start Test", выбираем случайную тему
                if (selectedId === "random") {
                  const topics = ["vocabulary", "reading", "writing"];
                  const randomTopic =
                    topics[Math.floor(Math.random() * topics.length)];
                  handleStartLesson(randomTopic);
                } else {
                  // Иначе запускаем то, что выбрали (reading, vocabulary, writing)
                  handleStartLesson(selectedId);
                }
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
