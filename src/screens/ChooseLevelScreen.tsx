import { type UiLangCode } from "../utils/detectUiLanguage";
import { t } from "../i18n";

interface Props {
  uiLanguage: UiLangCode;
  selectedLevel: string | null;
  onChangeSelected: (level: string) => void;
  onContinue: () => void;
  onStartTest: () => void;
}

const LEVELS = [
  { id: "A1", label: "A1", bg: "bg-A1" },
  { id: "A2", label: "A2", bg: "bg-A2" },
  { id: "B1", label: "B1", bg: "bg-B1" },
  { id: "B2", label: "B2", bg: "bg-B2" },
  { id: "C1", label: "C1", bg: "bg-C1" },
  { id: "C2", label: "C2", bg: "bg-C2" },
];

export const ChooseLevelScreen = ({
  uiLanguage,
  selectedLevel,
  onChangeSelected,
  onContinue,
  onStartTest,
}: Props) => {
  // Находим индекс выбранного уровня (0..5)
  const selectedIndex = LEVELS.findIndex((l) => l.id === selectedLevel);

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
        <h1 className="page-title">{t(uiLanguage, "level.selectTitle")}</h1>
        <p className="page-subtitle">{t(uiLanguage, "level.selectSubtitle")}</p>
      </div>

      <div className="level-grid-wrapper">
        {/* Кнопки уровней */}
        <div className="level-grid-row">
          {LEVELS.map((lvl) => {
            const isSelected = selectedLevel === lvl.id;
            return (
              <div
                key={lvl.id}
                className={`lvl-box ${lvl.bg} ${isSelected ? "selected" : ""}`}
                onClick={() => onChangeSelected(lvl.id)}
              >
                {lvl.label}
              </div>
            );
          })}
        </div>

        {/* Динамическая полоска прогресса */}
        <div className="level-bar">
          {LEVELS.map((lvl, index) => {
            // Закрашиваем, если индекс сегмента <= индекса выбранного уровня
            // Если уровень не выбран, selectedIndex = -1, все серые
            const isActive = selectedIndex >= 0 && index <= selectedIndex;
            return (
              <div
                key={lvl.id}
                className={`lvl-bar-seg ${isActive ? lvl.bg : "bg-gray"}`}
              />
            );
          })}
        </div>
      </div>

      {/* Блок с тестом (кнопка исправлена) */}
      <div style={{ textAlign: "center", marginBottom: "auto" }}>
        <p
          style={{
            marginBottom: 16,
            fontWeight: 600,
            color: "#374151",
            fontSize: 14,
          }}
        >
          {t(uiLanguage, "level.testTitle")}
        </p>
        <button className="btn-secondary" onClick={onStartTest}>
          {t(uiLanguage, "level.testSubtitle")}
        </button>
      </div>

      <button
        className="btn-primary"
        onClick={onContinue}
        disabled={!selectedLevel}
      >
        {t(uiLanguage, "common.continue")}
      </button>
    </div>
  );
};
