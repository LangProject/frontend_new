import { type UiLangCode } from "../utils/detectUiLanguage";
import { t } from "../i18n";

interface Props {
  uiLanguage: UiLangCode;
  selectedCode: string | null;
  onChangeSelected: (code: string) => void;
  onContinue: () => void;
}

const TARGET_LANGUAGES = [
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
];

export const ChooseLearningLanguageScreen = ({
  uiLanguage,
  selectedCode,
  onChangeSelected,
  onContinue,
}: Props) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      {/* Заголовок */}
      <div className="page-header-block">
        <h1 className="page-title">
          {t(uiLanguage, "chooseLearningLang.title")}
        </h1>
        {/* Можна додати підзаголовок, якщо потрібно, наприклад: */}
        {/* <p className="page-subtitle">{t(uiLanguage, "learningLanguage.subtitle")}</p> */}
      </div>

      {/* Список мов (Нові широкі картки) */}
      <div className="selection-list">
        {TARGET_LANGUAGES.map((lang) => {
          const isSelected = selectedCode === lang.code;
          return (
            <div
              key={lang.code}
              // Використовуємо клас wide-card з нового App.css
              className={`wide-card ${isSelected ? "selected" : ""}`}
              onClick={() => onChangeSelected(lang.code)}
            >
              <div className="card-left">
                <span className="card-flag">{lang.flag}</span>
                <span className="card-label">{lang.label}</span>
              </div>

              {/* Індикатор (кружечок) */}
              <div className="card-indicator" />
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Зелена кнопка */}
      <button
        className="btn-primary"
        onClick={onContinue}
        disabled={!selectedCode}
      >
        {t(uiLanguage, "common.continue")}
      </button>
    </div>
  );
};
