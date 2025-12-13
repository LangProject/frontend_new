import type { FC } from "react";
import { useMemo, useState } from "react";
import type { UiLangCode } from "../utils/detectUiLanguage";

type TabMode = "select" | "test";

type LevelCode = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

const LEVELS: Array<{
  code: LevelCode;
  color: string;
}> = [
  { code: "A1", color: "#7EDB7A" },
  { code: "A2", color: "#C7E66E" },
  { code: "B1", color: "#F2E36D" },
  { code: "B2", color: "#F6B86B" },
  { code: "C1", color: "#F08E6D" },
  { code: "C2", color: "#E85B5B" },
];

interface ChooseLevelScreenProps {
  uiLanguage: UiLangCode;
  learningLanguageCode: string | null;
  selectedLevel: string | null;
  onChangeSelected: (levelCode: string) => void;
  onContinue: () => void;
  onStartTest: () => void;
}

const languageNameFromCode = (code: string | null): string => {
  if (!code) return "Language";
  switch (code) {
    case "en":
      return "English";
    case "es":
      return "Spanish";
    case "de":
      return "German";
    case "fr":
      return "French";
    default:
      return code.toUpperCase();
  }
};

export const ChooseLevelScreen: FC<ChooseLevelScreenProps> = ({
  learningLanguageCode,
  selectedLevel,
  onChangeSelected,
  onContinue,
  onStartTest,
}) => {
  const [mode, setMode] = useState<TabMode>("select");

  const selected = (selectedLevel ?? "").toUpperCase() as LevelCode | "";
  const languageName = languageNameFromCode(learningLanguageCode);

  const selectedIndex = useMemo(() => {
    const idx = LEVELS.findIndex((l) => l.code === selected);
    return idx >= 0 ? idx : -1;
  }, [selected]);

  const canContinue = mode === "select" ? selectedIndex >= 0 : true;

  const handleContinue = () => {
    if (mode === "test") {
      onStartTest();
      return;
    }
    if (selectedIndex < 0) return;
    onContinue();
  };

  return (
    <div className="lvl-page">
      <div className="lvl-top-spacer" />

      <div className="lvl-tabs">
        <button
          type="button"
          className={"lvl-tab" + (mode === "select" ? " lvl-tab--active" : "")}
          onClick={() => setMode("select")}
        >
          Select My Level
        </button>
        <button
          type="button"
          className={"lvl-tab" + (mode === "test" ? " lvl-tab--active" : "")}
          onClick={() => setMode("test")}
        >
          Take a Test
        </button>
      </div>

      <h1 className="lvl-title">How well do you know {languageName}?</h1>

      {/* капсулы уровней */}
      <div className="lvl-pills">
        {LEVELS.map((lvl) => {
          const active = mode === "select" && selected === lvl.code;
          return (
            <button
              key={lvl.code}
              type="button"
              className={"lvl-pill" + (active ? " lvl-pill--active" : "")}
              onClick={() => {
                if (mode !== "select") return;
                onChangeSelected(lvl.code); // сохраняем "A1".."C2"
              }}
              style={
                active
                  ? ({
                      backgroundColor: lvl.color,
                      borderColor: "rgba(0,0,0,0.08)",
                    } as React.CSSProperties)
                  : undefined
              }
              aria-pressed={active}
            >
              {lvl.code}
            </button>
          );
        })}
      </div>

      {/* шкала */}
      <div className="lvl-bar">
        {LEVELS.map((lvl, i) => {
          const filled =
            mode === "test"
              ? i <= 3 // в режиме теста просто показываем пример заполнения
              : selectedIndex >= 0 && i <= selectedIndex;

          return (
            <div
              key={lvl.code}
              className={"lvl-bar-seg" + (filled ? " is-filled" : "")}
              style={
                filled ? ({ backgroundColor: lvl.color } as any) : undefined
              }
            />
          );
        })}
      </div>

      <div className="lvl-bottom-spacer" />

      <button
        type="button"
        className={"lvl-continue" + (!canContinue ? " is-disabled" : "")}
        onClick={handleContinue}
        disabled={!canContinue}
      >
        {mode === "test" ? "Start test →" : "Continue →"}
      </button>
    </div>
  );
};
