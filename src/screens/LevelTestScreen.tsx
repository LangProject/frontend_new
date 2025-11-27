import { useState, type FC } from "react";
import { PrimaryButton } from "../components/PrimaryButton";
import { t } from "../i18n";
import type { UiLangCode } from "../utils/detectUiLanguage";

const QUESTIONS = [
  "I can introduce myself and ask simple questions in this language.",
  "I can talk about my day, hobbies, and plans with some mistakes.",
  "I can understand movies or series without subtitles most of the time.",
];

interface LevelTestScreenProps {
  uiLanguage: UiLangCode;
  learningLanguageCode: string | null;
  onFinish: (detectedLevel: string) => void;
}

export const LevelTestScreen: FC<LevelTestScreenProps> = ({
  uiLanguage,
  learningLanguageCode,
  onFinish,
}) => {
  const [step, setStep] = useState(0);

  const languageName =
    {
      en: "English",
      de: "German",
      es: "Spanish",
      fr: "French",
      pl: "Polish",
    }[learningLanguageCode ?? "en"] || "English";

  const total = QUESTIONS.length;
  const isLast = step === total - 1;

  const handleNext = () => {
    if (!isLast) {
      setStep((s) => s + 1);
    } else {
      onFinish("b2"); // заглушка уровня
    }
  };

  return (
    <>
      <div className="page-title">{t(uiLanguage, "level.testTitle")}</div>
      <p className="page-subtitle">
        {t(uiLanguage, "level.testSubtitle")} {languageName}
      </p>

      <div className="level-test-card">
        <div className="level-test-progress">
          Question {step + 1} of {total}
        </div>
        <div className="level-test-question">{QUESTIONS[step]}</div>

        <div className="level-test-options">
          <button type="button" className="level-test-option">
            This is not true for me
          </button>
          <button type="button" className="level-test-option">
            Sometimes true
          </button>
          <button type="button" className="level-test-option">
            Definitely true
          </button>
        </div>
      </div>

      <PrimaryButton onClick={handleNext}>
        {isLast ? "Finish test" : "Next"}
      </PrimaryButton>
    </>
  );
};
