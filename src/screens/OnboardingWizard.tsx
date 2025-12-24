import { useState } from "react";
// Импортируем ваши компоненты
import { ChooseLanguageScreen } from "./ChooseLanguageScreen";
import { ChooseLearningLanguageScreen } from "./ChooseLearningLanguageScreen";
import { ChooseLevelScreen } from "./ChooseLevelScreen";

// Типы (если они у вас в отдельном файле, можно импортировать оттуда)
import type { UiLangCode } from "../utils/detectUiLanguage";

// --- НАСТРОЙКИ ---
const API_URL = ""; // Оставьте пустым, если используете Vite proxy

// Маппинг кодов (фронт) в полные названия (бэк)
// Бэкенд (судя по OpenAPI) ожидает полные названия: "english", "spanish" и т.д.
const LANG_MAP: Record<string, string> = {
  en: "english",
  de: "german",
  es: "spanish",
  fr: "french",
  pl: "polish",
  it: "italian",
  pt: "portuguese",
  ru: "russian",
  uk: "ukrainian",
};

interface Props {
  onFinish: () => void; // Функция, которая вызовется после успешной отправки
}

export const OnboardingWizard = ({ onFinish }: Props) => {
  // 1. Состояние шагов (1 -> 2 -> 3)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // 2. Данные, которые мы собираем
  const [uiLangCode, setUiLangCode] = useState<string>("en"); // Шаг 1
  const [learnLangCode, setLearnLangCode] = useState<string | null>(null); // Шаг 2
  const [levelCode, setLevelCode] = useState<string | null>(null); // Шаг 3

  // --- ЛОГИКА ОТПРАВКИ НА БЭКЕНД ---
  const submitToBackend = async (finalLevel: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Преобразуем коды "en" -> "english" для бэка
      const sourceFull = LANG_MAP[uiLangCode] || "english";
      const targetFull =
        (learnLangCode && LANG_MAP[learnLangCode]) || "spanish";

      const payload = {
        source_language: sourceFull,
        target_language: targetFull,
        language_level: finalLevel,
      };

      console.log("🚀 Sending Init Data:", payload);

      const response = await fetch(`${API_URL}/user/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      // Сохраняем настройки локально для мгновенного обновления UI
      localStorage.setItem("ui_language", uiLangCode);
      localStorage.setItem("learning_language", learnLangCode || "en");
      localStorage.setItem("learning_level", finalLevel);
      localStorage.setItem("setup_complete", "true");

      // Переходим в приложение
      onFinish();
    } catch (error) {
      console.error(error);
      alert("Error saving progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- РЕНДЕР: ШАГ 1 (Язык интерфейса) ---
  if (step === 1) {
    return (
      <div className="onboarding-wrapper">
        <ChooseLanguageScreen
          uiLanguage={uiLangCode as UiLangCode}
          selectedCode={uiLangCode}
          onChangeSelected={(code) => setUiLangCode(code)}
          onContinue={() => setStep(2)}
        />
      </div>
    );
  }

  // --- РЕНДЕР: ШАГ 2 (Изучаемый язык) ---
  if (step === 2) {
    return (
      <div className="onboarding-wrapper">
        <ChooseLearningLanguageScreen
          uiLanguage={uiLangCode as UiLangCode}
          selectedCode={learnLangCode}
          onChangeSelected={(code) => setLearnLangCode(code)}
          onContinue={() => setStep(3)}
        />
      </div>
    );
  }

  // --- РЕНДЕР: ШАГ 3 (Уровень) ---
  if (step === 3) {
    return (
      <div className="onboarding-wrapper">
        <ChooseLevelScreen
          learningLanguageCode={learnLangCode}
          selectedLevel={levelCode}
          onChangeSelected={(lvl) => setLevelCode(lvl)}
          onStartTest={() => alert("Test mode is coming soon!")}
          onContinue={() => {
            if (levelCode) submitToBackend(levelCode);
          }}
        />

        {/* Индикатор загрузки */}
        {loading && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255,255,255,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#58cc02",
            }}
          >
            Setting up your profile...
          </div>
        )}
      </div>
    );
  }

  return null;
};
