import { type UiLangCode } from "../utils/detectUiLanguage";
import { t } from "../i18n";

interface Props {
  uiLanguage: UiLangCode;
  selectedCode: UiLangCode;
  onChangeSelected: (code: UiLangCode) => void;
  onContinue: () => void;
}

const UI_LANGUAGES = [
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export const ChooseLanguageScreen = ({
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
      <div className="page-header-block">
        <h1 className="page-title">{t(uiLanguage, "chooseUiLang.title")}</h1>
        <p className="page-subtitle">{t(uiLanguage, "uiLanguage.subtitle")}</p>
      </div>

      <div className="selection-list">
        {UI_LANGUAGES.map((lang) => {
          const isSelected = selectedCode === lang.code;
          return (
            <div
              key={lang.code}
              className={`wide-card ${isSelected ? "selected" : ""}`}
              onClick={() => onChangeSelected(lang.code as UiLangCode)}
            >
              <div className="card-left">
                <span className="card-flag">{lang.flag}</span>
                <span className="card-label">{lang.label}</span>
              </div>

              <div className="card-indicator" />
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      <button className="btn-primary" onClick={onContinue}>
        {t(uiLanguage, "common.continue")}
      </button>
    </div>
  );
};
